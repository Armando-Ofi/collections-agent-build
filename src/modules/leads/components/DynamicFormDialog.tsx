import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { useDynamicForm, type Question } from '../hooks/useDynamicForm';
import {
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  HelpCircle,
  MessageSquare,
  Loader2,
  Phone
} from 'lucide-react';
import Error from '@/shared/components/common/Error';

interface DynamicFormDialogProps {
  leadId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DynamicFormDialog: React.FC<DynamicFormDialogProps> = ({
  leadId: lead,
  isOpen,
  onOpenChange,
}) => {
  const {
    questions,
    questionsLoading,
    questionsError,
    answers,
    isFormValid,
    isFormReady, // Nueva propiedad
    isSubmitting,
    submitError,
    submitSuccess,
    fetchQuestions,
    updateAnswer,
    submitForm,
    resetForm
  } = useDynamicForm(lead || null);

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  // Debug effect para monitorear cambios
  useEffect(() => {
    console.log('Component state:', {
      questionsLength: questions.length,
      isFormReady,
      answersCount: Object.keys(answers).length,
      questionsLoading,
      questionsError
    });
  }, [questions, isFormReady, answers, questionsLoading, questionsError]);

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers[question.question_header];
    
    // Verificar que la respuesta exista antes de renderizar
    if (answer === undefined) {
      console.warn(`Answer for question "${question.question_header}" is undefined`);
      return null;
    }
    
    if (question.question_type === 'open-ended') {
      return (
        <Card key={`${question.question_header}-${index}`} className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              {question.question_header}
              <Badge variant="outline" className="glass-card border-white/10 text-xs">
                Open-ended
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.question_content}
            </p>
            <Textarea
              placeholder="Enter your detailed response..."
              value={typeof answer === 'string' ? answer : ''}
              onChange={(e) => updateAnswer(question.question_header, e.target.value)}
              className="glass-card border-white/10 min-h-[100px] resize-none"
              required
            />
            {typeof answer === 'string' && answer.trim() === '' && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                This field is required
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    if (question.question_type === 'closed-ended') {
      return (
        <Card key={`${question.question_header}-${index}`} className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              {question.question_header}
              <Badge variant="outline" className="glass-card border-white/10 text-xs">
                Yes/No
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.question_content}
            </p>
            <RadioGroup
              value={typeof answer === 'boolean' ? (answer ? 'yes' : 'no') : ''}
              onValueChange={(value) => updateAnswer(question.question_header, value === 'yes')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="yes" 
                  id={`${question.question_header}-yes-${index}`}
                  className="border-white/20 text-green-500"
                />
                <Label 
                  htmlFor={`${question.question_header}-yes-${index}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="no" 
                  id={`${question.question_header}-no-${index}`}
                  className="border-white/20 text-red-500"
                />
                <Label 
                  htmlFor={`${question.question_header}-no-${index}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  No
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/10 dark:border-white/10 max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Phone className="w-6 h-6 text-blue-500" />
            Call Log Form
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[600px]">
          {/* Questions Loading State */}
          {questionsLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted-foreground">Loading assessment questions...</p>
              </div>
            </div>
          )}

          {/* Questions Error State */}
          {questionsError && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Error title="Error loading assessment questions" />
              <p className="text-sm text-red-400 text-center">{questionsError}</p>
              <Button
                onClick={fetchQuestions}
                variant="outline"
                className="glass-card border-white/10"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Success State */}
          {submitSuccess && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Form Submitted Successfully!</h3>
                <p className="text-muted-foreground">Your assessment responses have been recorded.</p>
              </div>
              <Button
                onClick={handleClose}
                className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              >
                Close
              </Button>
            </div>
          )}

          {/* Form Content - Mejorada la condición de renderizado */}
          {!questionsLoading && !questionsError && !submitSuccess && questions.length > 0 && isFormReady && (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const renderedQuestion = renderQuestion(question, index);
                    if (!renderedQuestion) {
                      console.warn(`Failed to render question at index ${index}:`, question);
                    }
                    return renderedQuestion;
                  }).filter(Boolean)} {/* Filtrar elementos null */}
                </div>
              </ScrollArea>

              {/* Form Actions */}
              <div className="pt-4 border-t border-white/10">
                {submitError && (
                  <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">{submitError}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>
                      {Object.values(answers).filter(answer => 
                        typeof answer === 'string' ? answer.trim() !== '' : typeof answer === 'boolean'
                      ).length} of {questions.length} questions completed
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="glass-card border-white/10"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitForm}
                      disabled={!isFormValid || isSubmitting}
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Assessment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!questionsLoading && !questionsError && !submitSuccess && questions.length === 0 && !isFormReady && (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assessment questions available</p>
            </div>
          )}

          {/* Debug info - remover en producción */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
              Q: {questions.length} | A: {Object.keys(answers).length} | Ready: {isFormReady.toString()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicFormDialog;