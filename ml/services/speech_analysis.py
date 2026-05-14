import re

class SpeechAnalysisEngine:
    def __init__(self):
        # Common phonetic/text markers of slurred or confused speech in text transcription
        self.confusion_markers = [
            "um", "uh", "like", "you know", "i mean", "what", "where am i", 
            "i don't know", "confused", "can't remember"
        ]
        
    def analyze_text_input(self, text: str) -> dict:
        """
        Analyzes transcribed text for markers of aphasia or slurred speech
        """
        if not text or len(text.strip()) == 0:
            return {"fluency_score": 0, "confusion_indicators": ["No speech detected"], "risk_level": "Severe"}
            
        text_lower = text.lower()
        indicators = []
        
        # 1. Word Count & Length
        words = text.split()
        word_count = len(words)
        
        # Short sentences might indicate struggling
        if word_count < 3 and len(text) > 0:
            indicators.append("Extremely short utterance")
            
        # 2. Repeated characters (indicative of slurring in raw transcription)
        repeated_chars = re.findall(r'(.)\1{3,}', text_lower)
        if repeated_chars:
            indicators.append(f"Slurred speech markers detected ({len(repeated_chars)} instances)")
            
        # 3. Repeated words (stuttering or struggling to find words)
        repeated_words = 0
        for i in range(len(words) - 1):
            if words[i] == words[i+1]:
                repeated_words += 1
        if repeated_words > 0:
            indicators.append(f"Word repetition detected ({repeated_words} instances)")
            
        # 4. Confusion Markers
        confusion_count = sum(1 for marker in self.confusion_markers if marker in text_lower)
        if confusion_count > 0:
            indicators.append(f"Cognitive confusion markers detected ({confusion_count})")
            
        # Calculate fluency score (0-100, higher is better)
        # Base is 100, deduct for issues
        deductions = 0
        deductions += len(repeated_chars) * 15
        deductions += repeated_words * 10
        deductions += confusion_count * 12
        
        if word_count < 3:
            deductions += 20
            
        score = max(0, 100 - deductions)
        
        # Categorize risk (Inverted: low score = high risk)
        if score < 40:
            risk = "Severe"
        elif score < 70:
            risk = "Moderate"
        elif score < 90:
            risk = "Mild"
        else:
            risk = "Normal"
            
        # FAST flag
        if score < 70:
            indicators.append("Speech (S of FAST)")
            
        return {
            "fluency_score": score,
            "confusion_indicators": indicators,
            "risk_level": risk
        }

    def analyze_audio_mock(self, audio_bytes: bytes) -> dict:
        """
        Mock for actual audio processing. Returns a synthetic score based on audio bytes length.
        """
        if not audio_bytes:
            return {"fluency_score": 0, "confusion_indicators": ["No audio detected"], "risk_level": "Severe"}
            
        length = len(audio_bytes)
        # Simulate different scenarios based on file size
        if length % 5 == 0:
            score = 45 # Moderate risk
            indicators = ["Hesitation detected in audio", "Speech (S of FAST)"]
            risk = "Moderate"
        elif length % 7 == 0:
            score = 25 # Severe risk
            indicators = ["Slurred syllables detected", "Significant pausing", "Speech (S of FAST)"]
            risk = "Severe"
        else:
            score = 95
            indicators = []
            risk = "Normal"
            
        return {
            "fluency_score": score,
            "confusion_indicators": indicators,
            "risk_level": risk
        }
