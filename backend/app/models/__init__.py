# models/__init__.py
from .user import User
from .patient import Patient
from .consultation import Consultation
from .medicine import Medicine
from .consultation_medicine import ConsultationMedicine
from .exam import Exam
from .consultation_exam import ConsultationExam
from .payment import Payment
from .ai_report import AIReport
from .chat_message import ChatMessage

__all__ = [
    "User", "Patient", "Consultation",
    "Medicine", "ConsultationMedicine",
    "Exam", "ConsultationExam",
    "Payment", "AIReport", "ChatMessage"
]