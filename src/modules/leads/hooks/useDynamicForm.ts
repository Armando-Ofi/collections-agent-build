import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

export interface Question {
  question_type: 'open-ended' | 'closed-ended';
  question_header: string;
  question_content: string;
}

export interface FormAnswer {
  question: string;
  answer: string | boolean;
}

interface UseDynamicFormReturn {
  // Questions state
  questions: Question[];
  questionsLoading: boolean;
  questionsError: string | null;
  
  // Form state
  answers: Record<string, string | boolean>;
  isFormValid: boolean;
  isFormReady: boolean; // Nueva propiedad para asegurar renderizado
  
  // Submit state
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  
  // Actions
  fetchQuestions: () => Promise<void>;
  updateAnswer: (questionHeader: string, answer: string | boolean) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

export const useDynamicForm = (leadId: string | null): UseDynamicFormReturn => {
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // Form state
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [isFormReady, setIsFormReady] = useState(false);
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize answers when questions change
  const initializeAnswers = useCallback((questionsData: Question[]) => {
    const initialAnswers: Record<string, string | boolean> = {};
    questionsData.forEach((question: Question) => {
      initialAnswers[question.question_header] = question.question_type === 'closed-ended' ? false : '';
    });
    
    console.log('Initializing answers:', initialAnswers); // Debug log
    setAnswers(initialAnswers);
    setIsFormReady(true); // Marcar form como listo
  }, []);

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    if (!leadId) return;
    
    setQuestionsLoading(true);
    setQuestionsError(null);
    setIsFormReady(false);
    
    try {
      const response = await axios.get(`https://n8n.sofiatechnology.ai/webhook/c991ffcc-87e1-4ad5-bad2-b097e17bb53?id=${leadId}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = response.data;
      console.log('Questions fetched:', data); // Debug log
      
      // Validar que data sea un array válido
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No questions received or invalid format');
      }
      
      // Actualizar questions y answers en secuencia
      setQuestions(data);
      initializeAnswers(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      setQuestionsError(errorMessage);
      console.error('Error fetching dynamic questions:', err);
      setIsFormReady(false);
    } finally {
      setQuestionsLoading(false);
    }
  }, [leadId, initializeAnswers]);

  // Update individual answer
  const updateAnswer = useCallback((questionHeader: string, answer: string | boolean) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionHeader]: answer
      };
      console.log('Answer updated:', { questionHeader, answer, newAnswers }); // Debug log
      return newAnswers;
    });
    
    // Clear submit states when form is modified
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  // Check if form is valid (all questions answered)
  const isFormValid = isFormReady && questions.length > 0 && questions.every(question => {
    const answer = answers[question.question_header];
    if (question.question_type === 'closed-ended') {
      return typeof answer === 'boolean';
    } else {
      return typeof answer === 'string' && answer.trim() !== '';
    }
  });

  // Submit form
  const submitForm = useCallback(async () => {
    if (!leadId || !isFormValid) {
      console.warn('Cannot submit: leadId or form invalid', { leadId, isFormValid });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const formData: FormAnswer[] = questions.map(question => ({
        question: question.question_content,
        answer: answers[question.question_header]
      }));
      
      console.log('Submitting form data:', formData); // Debug log
      
      const response = await axios.post(`https://n8n.sofiatechnology.ai/webhook/f21ba7cd-22de-4ef9-87f6-c594d6bb5f5b`, {
        lead_id: leadId,
        questions: formData
      });
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSubmitSuccess(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      setSubmitError(errorMessage);
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [leadId, isFormValid, questions, answers]);

  // Reset form state
  const resetForm = useCallback(() => {
    setAnswers({});
    setSubmitError(null);
    setSubmitSuccess(false);
    setQuestions([]);
    setQuestionsError(null);
    setIsFormReady(false);
    console.log('Form reset'); // Debug log
  }, []);

  // Fetch questions when leadId changes
  useEffect(() => {
    if (leadId) {
      fetchQuestions();
    } else {
      resetForm();
    }
  }, [leadId, fetchQuestions, resetForm]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('State update:', {
      questionsLength: questions.length,
      answersKeys: Object.keys(answers),
      isFormReady,
      questionsLoading,
      questionsError
    });
  }, [questions, answers, isFormReady, questionsLoading, questionsError]);

  return {
    // Questions state
    questions,
    questionsLoading,
    questionsError,
    
    // Form state
    answers,
    isFormValid,
    isFormReady,
    
    // Submit state
    isSubmitting,
    submitError,
    submitSuccess,
    
    // Actions
    fetchQuestions,
    updateAnswer,
    submitForm,
    resetForm
  };
};