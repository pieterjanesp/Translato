from abc import ABC, abstractmethod

class BaseDocumentHandler(ABC):
    """Abstract base class for document handlers."""

    @abstractmethod
    def extract_text(self, file_path: str) -> list[str]:
        """Extract Translatable text from document."""
        pass 
    
    @abstractmethod
    def replace_text(self, file_path: str, translations: dict[str, str], output_path: str) -> None:
          """Replace original text with translations and save."""
          pass