import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from sqlmodel import select
from datetime import datetime

from app.db.session import get_session
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.chat_message import ChatMessage
from app.core.config import settings

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY)


class AssistantMessageIn(BaseModel):
    sender: str
    message: str


class AssistantHistoryIn(BaseModel):
    messages: list[AssistantMessageIn]

def build_patient_context(db, patient_id: Optional[int]) -> str:
    if not patient_id:
        return "No patient ID provided."
    patient = db.get(Patient, patient_id)
    if not patient:
        return "Patient not found."

    name = f"{patient.first_name or ''} {patient.last_name or ''}".strip() or "Unknown"
    ctx = [f"Name: {name}"]
    if patient.date_of_birth:
        ctx.append(f"Date of birth: {patient.date_of_birth}")
    if patient.gender:
        ctx.append(f"Gender: {patient.gender}")
    if getattr(patient, 'personal_history', None):
        ctx.append(f"Personal history: {patient.personal_history}")
    if getattr(patient, 'family_history', None):
        ctx.append(f"Family history: {patient.family_history}")

    recent = db.exec(
        select(Consultation)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.desc())
        .limit(3)
    ).all()

    if recent:
        summaries = [f"{c.consultation_date}: {c.motif} / {c.diagnosis}" for c in recent]
        ctx.append("Recent consultations: " + "; ".join(summaries))

    return "\n".join(ctx)


def _fetch_patient_assistant_messages(db, patient_id: int):
    return db.exec(
        select(ChatMessage, Consultation)
        .join(Consultation, ChatMessage.consultation_id == Consultation.id)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.asc(), ChatMessage.created_at.asc(), ChatMessage.id.asc())
    ).all()


@router.get("/history/{patient_id}")
async def get_assistant_history(patient_id: int, db=Depends(get_session)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    rows = _fetch_patient_assistant_messages(db, patient_id)
    return [
        {
            "id": msg.id,
            "consultation_id": msg.consultation_id,
            "sender": msg.sender,
            "message": msg.message,
            "created_at": msg.created_at,
        }
        for msg, _consultation in rows
    ]


@router.post("/history/{consultation_id}")
async def save_assistant_history(
    consultation_id: int,
    payload: AssistantHistoryIn,
    db=Depends(get_session),
):
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

    saved_messages = []
    for item in payload.messages:
        sender = item.sender.strip().lower()
        if sender not in {"doctor", "ai"}:
            continue
        message = ChatMessage(
            consultation_id=consultation_id,
            sender=sender,
            message=item.message,
            created_at=datetime.utcnow(),
        )
        db.add(message)
        saved_messages.append(message)

    db.commit()
    for message in saved_messages:
        db.refresh(message)

    return {
        "message": "Assistant history saved successfully",
        "saved": len(saved_messages),
    }


@router.get("/stream")
async def assistant_stream(
    question: str,
    patient_id: Optional[int] = None,
    db=Depends(get_session)
):
    patient_ctx = build_patient_context(db, patient_id)

    system_msg = (
        "You are a clinical AI assistant helping a doctor during consultations. "
        "Be concise (1-3 sentences max). Never give a definitive diagnosis. "
        "Always say your suggestions are recommendations only. "
        "If urgent action is needed, start with 'ALERT:'. "
        "Respond in the same language as the doctor's question."
    )

    user_msg = f"Patient context:\n{patient_ctx}\n\nDoctor's question: {question}"

    def event_stream():
        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.2,
                max_tokens=300,
                stream=True,
            )
            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    yield f"data: {token}\n\n"
            yield "event: done\ndata: [DONE]\n\n"
        except Exception as e:
            yield f"event: error\ndata: {str(e)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )