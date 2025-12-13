"""
Sentiment analysis utility for complaint text analysis
"""
import re
import logging
from typing import Dict, Any
import numpy as np

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Simple rule-based sentiment analyzer for complaint text"""
    
    def __init__(self):
        # Define sentiment keywords
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
            'perfect', 'love', 'like', 'happy', 'satisfied', 'pleased', 
            'thank', 'thanks', 'appreciate', 'helpful', 'friendly', 'quick',
            'fast', 'efficient', 'professional', 'courteous', 'polite',
            'outstanding', 'superb', 'brilliant', 'awesome', 'incredible',
            'marvelous', 'exceptional', 'remarkable', 'impressive', 'delighted',
            'thrilled', 'grateful', 'blessed', 'fortunate', 'lucky', 'smooth',
            'seamless', 'flawless', 'reliable', 'trustworthy', 'recommended'
        }
        
        self.negative_words = {
            'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 
            'angry', 'frustrated', 'disappointed', 'unsatisfied', 'poor',
            'slow', 'rude', 'unprofessional', 'useless', 'broken', 'failed',
            'error', 'problem', 'issue', 'complaint', 'wrong', 'worst',
            'never', 'cancel', 'refund', 'money', 'waste', 'scam',
            'pathetic', 'ridiculous', 'unacceptable', 'outrageous', 'shocking',
            'appalling', 'dreadful', 'atrocious', 'abysmal', 'deplorable',
            'inadequate', 'insufficient', 'defective', 'faulty', 'damaged',
            'unreliable', 'untrustworthy', 'dishonest', 'fraudulent', 'misleading'
        }
        
        self.intensifiers = {
            'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'quite': 1.2,
            'absolutely': 1.8, 'completely': 1.7, 'totally': 1.6
        }
        
        self.negations = {
            'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 
            'neither', 'nor', 'none', 'cannot', 'cant', 'wont', 'dont'
        }
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of given text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary containing comprehensive sentiment analysis results
        """
        try:
            # Preprocess text
            processed_text = self._preprocess_text(text)
            words = processed_text.split()
            
            # Calculate sentiment scores
            scores = self._calculate_sentiment_scores(words)
            
            # Determine overall sentiment
            sentiment = self._determine_sentiment(scores)
            
            # Calculate confidence
            confidence = self._calculate_confidence(scores)
            
            # Predict category (simple keyword-based)
            category = self._predict_category(processed_text)
            
            # Additional analysis features
            urgency_level = self._detect_urgency(processed_text)
            emotion_indicators = self._detect_emotions(processed_text)
            key_phrases = self._extract_key_phrases(words)
            sentiment_strength = self._calculate_sentiment_strength(scores)
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'scores': scores,
                'category': category,
                'word_count': len(words),
                'analysis_timestamp': np.datetime64('now').astype(str),
                'urgency_level': urgency_level,
                'emotion_indicators': emotion_indicators,
                'key_phrases': key_phrases,
                'sentiment_strength': sentiment_strength,
                'text_length': len(text),
                'processed_text': processed_text
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return {
                'sentiment': 'Neutral',
                'confidence': 0.5,
                'scores': {'positive': 0.33, 'neutral': 0.34, 'negative': 0.33},
                'category': 'General',
                'error': str(e),
                'word_count': 0,
                'analysis_timestamp': np.datetime64('now').astype(str)
            }
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _calculate_sentiment_scores(self, words: list) -> Dict[str, float]:
        """Calculate sentiment scores based on word analysis"""
        positive_score = 0.0
        negative_score = 0.0
        total_words = len(words)
        
        i = 0
        while i < len(words):
            word = words[i]
            
            # Check for intensifiers
            intensifier = 1.0
            if i > 0 and words[i-1] in self.intensifiers:
                intensifier = self.intensifiers[words[i-1]]
            
            # Check for negations
            negated = False
            if i > 0 and words[i-1] in self.negations:
                negated = True
            elif i > 1 and words[i-2] in self.negations:
                negated = True
            
            # Calculate sentiment contribution
            if word in self.positive_words:
                score = 1.0 * intensifier
                if negated:
                    negative_score += score
                else:
                    positive_score += score
            elif word in self.negative_words:
                score = 1.0 * intensifier
                if negated:
                    positive_score += score
                else:
                    negative_score += score
            
            i += 1
        
        # Normalize scores
        total_sentiment_words = positive_score + negative_score
        
        if total_sentiment_words > 0:
            positive_ratio = positive_score / total_sentiment_words
            negative_ratio = negative_score / total_sentiment_words
            neutral_ratio = max(0, 1 - positive_ratio - negative_ratio)
        else:
            # No sentiment words found - assume neutral
            positive_ratio = 0.2
            negative_ratio = 0.2
            neutral_ratio = 0.6
        
        # Ensure scores sum to 1
        total = positive_ratio + negative_ratio + neutral_ratio
        if total > 0:
            positive_ratio /= total
            negative_ratio /= total
            neutral_ratio /= total
        
        return {
            'positive': round(positive_ratio, 3),
            'negative': round(negative_ratio, 3),
            'neutral': round(neutral_ratio, 3)
        }
    
    def _determine_sentiment(self, scores: Dict[str, float]) -> str:
        """Determine overall sentiment from scores"""
        max_score = max(scores.values())
        
        if scores['positive'] == max_score and scores['positive'] > 0.4:
            return 'Positive'
        elif scores['negative'] == max_score and scores['negative'] > 0.4:
            return 'Negative'
        else:
            return 'Neutral'
    
    def _calculate_confidence(self, scores: Dict[str, float]) -> float:
        """Calculate confidence in the sentiment prediction"""
        max_score = max(scores.values())
        second_max = sorted(scores.values(), reverse=True)[1]
        
        # Confidence is based on the difference between top two scores
        confidence = max_score - second_max
        
        # Normalize to 0.5-0.95 range
        confidence = 0.5 + (confidence * 0.45)
        
        return round(confidence, 3)
    
    def _predict_category(self, text: str) -> str:
        """Predict complaint category based on keywords"""
        category_keywords = {
            'Billing': [
                'bill', 'billing', 'charge', 'payment', 'money', 'cost', 
                'price', 'fee', 'invoice', 'refund', 'credit', 'debit'
            ],
            'Technical': [
                'internet', 'connection', 'wifi', 'network', 'speed', 'slow',
                'outage', 'down', 'technical', 'equipment', 'modem', 'router'
            ],
            'Service': [
                'service', 'customer', 'support', 'help', 'representative',
                'agent', 'call', 'phone', 'wait', 'hold', 'response'
            ],
            'Product': [
                'product', 'feature', 'channel', 'tv', 'cable', 'package',
                'plan', 'subscription', 'upgrade', 'downgrade'
            ]
        }
        
        category_scores = {}
        
        for category, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            category_scores[category] = score
        
        # Return category with highest score, or 'General' if no matches
        if category_scores and max(category_scores.values()) > 0:
            return max(category_scores, key=category_scores.get)
        else:
            return 'General'
    
    def analyze_batch(self, texts: list) -> list:
        """Analyze sentiment for multiple texts"""
        results = []
        
        for text in texts:
            result = self.analyze(text)
            results.append(result)
        
        return results
    
    def _detect_urgency(self, text: str) -> str:
        """Detect urgency level in the text"""
        urgent_keywords = {
            'high': ['urgent', 'emergency', 'immediately', 'asap', 'critical', 'serious', 'help'],
            'medium': ['soon', 'quickly', 'fast', 'resolve', 'fix', 'please'],
            'low': ['when', 'possible', 'convenient', 'eventually']
        }
        
        high_count = sum(1 for word in urgent_keywords['high'] if word in text)
        medium_count = sum(1 for word in urgent_keywords['medium'] if word in text)
        low_count = sum(1 for word in urgent_keywords['low'] if word in text)
        
        if high_count > 0:
            return 'High'
        elif medium_count > 1:
            return 'Medium'
        elif medium_count > 0 or low_count > 0:
            return 'Low'
        else:
            return 'Normal'
    
    def _detect_emotions(self, text: str) -> Dict[str, bool]:
        """Detect specific emotions in the text"""
        emotion_keywords = {
            'anger': ['angry', 'furious', 'mad', 'rage', 'outraged', 'livid'],
            'frustration': ['frustrated', 'annoyed', 'irritated', 'bothered'],
            'disappointment': ['disappointed', 'let down', 'expected better'],
            'satisfaction': ['satisfied', 'pleased', 'content', 'happy'],
            'gratitude': ['thank', 'grateful', 'appreciate', 'thanks']
        }
        
        detected_emotions = {}
        for emotion, keywords in emotion_keywords.items():
            detected_emotions[emotion] = any(keyword in text for keyword in keywords)
        
        return detected_emotions
    
    def _extract_key_phrases(self, words: list) -> list:
        """Extract key phrases from the text"""
        # Simple key phrase extraction based on sentiment words and important terms
        key_phrases = []
        
        # Look for phrases with sentiment words
        for i, word in enumerate(words):
            if word in self.positive_words or word in self.negative_words:
                # Get context around sentiment word
                start = max(0, i-2)
                end = min(len(words), i+3)
                phrase = ' '.join(words[start:end])
                key_phrases.append(phrase)
        
        # Remove duplicates and limit to top 3
        key_phrases = list(set(key_phrases))[:3]
        return key_phrases
    
    def _calculate_sentiment_strength(self, scores: Dict[str, float]) -> str:
        """Calculate the strength of sentiment"""
        max_score = max(scores.values())
        
        if max_score >= 0.8:
            return 'Very Strong'
        elif max_score >= 0.6:
            return 'Strong'
        elif max_score >= 0.4:
            return 'Moderate'
        else:
            return 'Weak'
    
    def get_sentiment_summary(self, results: list) -> Dict[str, Any]:
        """Get comprehensive summary statistics from batch analysis results"""
        if not results:
            return {}
        
        sentiments = [r['sentiment'] for r in results]
        categories = [r['category'] for r in results]
        urgency_levels = [r.get('urgency_level', 'Normal') for r in results]
        
        sentiment_counts = {
            'Positive': sentiments.count('Positive'),
            'Neutral': sentiments.count('Neutral'),
            'Negative': sentiments.count('Negative')
        }
        
        category_counts = {}
        for category in categories:
            category_counts[category] = category_counts.get(category, 0) + 1
        
        urgency_counts = {}
        for urgency in urgency_levels:
            urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1
        
        avg_confidence = np.mean([r['confidence'] for r in results])
        avg_word_count = np.mean([r.get('word_count', 0) for r in results])
        
        # Emotion analysis
        all_emotions = {}
        for result in results:
            emotions = result.get('emotion_indicators', {})
            for emotion, detected in emotions.items():
                if detected:
                    all_emotions[emotion] = all_emotions.get(emotion, 0) + 1
        
        return {
            'total_analyzed': len(results),
            'sentiment_distribution': sentiment_counts,
            'category_distribution': category_counts,
            'urgency_distribution': urgency_counts,
            'emotion_distribution': all_emotions,
            'average_confidence': round(avg_confidence, 3),
            'average_word_count': round(avg_word_count, 1),
            'most_common_sentiment': max(sentiment_counts, key=sentiment_counts.get),
            'most_common_category': max(category_counts, key=category_counts.get) if category_counts else 'General',
            'most_common_urgency': max(urgency_counts, key=urgency_counts.get) if urgency_counts else 'Normal'
        }