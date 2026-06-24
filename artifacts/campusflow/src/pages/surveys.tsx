import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  surveyStore,
  type Survey,
  type SurveyQuestion,
} from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  ToggleLeft,
} from "lucide-react";

type View = "list" | "respond" | "create" | "responses";

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHov(s)}
          onMouseLeave={() => setHov(0)}
          onClick={() => onChange(s)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${(hov || value) >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Surveys() {
  const { user } = useAuth();
  const isStaff = user?.role === "faculty" || user?.role === "admin";
  const [surveys, setSurveys] = useState<Survey[]>(() => surveyStore.getAll());
  const [view, setView] = useState<View>("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: uid(), text: "", type: "rating" },
  ]);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(() => setSurveys(surveyStore.getAll()), []);

  const openRespond = (s: Survey) => {
    setSelectedSurvey(s);
    setAnswers({});
    setSubmitted(false);
    setView("respond");
  };

  const handleRespond = () => {
    if (!user || !selectedSurvey) return;
    setSubmitting(true);
    setTimeout(() => {
      surveyStore.respond(selectedSurvey.id, {
        studentId: user.id,
        studentName: user.name,
        answers,
        submittedAt: new Date().toISOString(),
      });
      setSubmitting(false);
      setSubmitted(true);
      refresh();
    }, 500);
  };

  const addQuestion = () =>
    setQuestions((q) => [...q, { id: uid(), text: "", type: "rating" }]);
  const removeQuestion = (id: string) =>
    setQuestions((q) => q.filter((q2) => q2.id !== id));
  const updateQuestion = (id: string, patch: Partial<SurveyQuestion>) =>
    setQuestions((q) =>
      q.map((q2) => (q2.id === id ? { ...q2, ...patch } : q2)),
    );

  const handleCreate = () => {
    if (!user || !newTitle || questions.some((q) => !q.text)) return;
    setCreating(true);
    setTimeout(() => {
      surveyStore.create({
        title: newTitle,
        description: newDesc,
        questions,
        createdBy: user.name,
        createdByRole: user.role,
        isActive: true,
      });
      refresh();
      setCreating(false);
      setView("list");
      setNewTitle("");
      setNewDesc("");
      setQuestions([{ id: uid(), text: "", type: "rating" }]);
    }, 400);
  };

  const active = surveys.filter((s) => s.isActive);
  const all = surveys;

  const displayList = user?.role === "student" ? active : all;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Surveys & Feedback
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {user?.role === "student"
                      ? "Share your feedback on campus services."
                      : "Manage surveys and view responses."}
                  </p>
                </div>
                {isStaff && (
                  <Button onClick={() => setView("create")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Survey
                  </Button>
                )}
              </div>

              {displayList.length === 0 ? (
                <Card className="glass-card text-center py-12">
                  <CardContent>
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {isStaff
                        ? "No surveys yet. Create one!"
                        : "No active surveys at the moment."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {displayList.map((s, i) => {
                    const hasResponded = user
                      ? surveyStore.hasResponded(s.id, user.id)
                      : false;
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="glass-card hover:border-primary/20 transition-all">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge
                                    className={
                                      s.isActive
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-muted/20 text-muted-foreground"
                                    }
                                  >
                                    {s.isActive ? "Active" : "Closed"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {s.questions.length} question
                                    {s.questions.length > 1 ? "s" : ""}
                                  </span>
                                  {isStaff && (
                                    <span className="text-xs text-muted-foreground">
                                      {s.responses.length} response
                                      {s.responses.length !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold">{s.title}</h3>
                                {s.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {s.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  By {s.createdBy}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                {user?.role === "student" && (
                                  <Button
                                    size="sm"
                                    variant={
                                      hasResponded ? "outline" : "default"
                                    }
                                    disabled={hasResponded}
                                    onClick={() => openRespond(s)}
                                  >
                                    {hasResponded ? "✓ Responded" : "Respond"}
                                  </Button>
                                )}
                                {isStaff && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedSurvey(s);
                                        setView("responses");
                                      }}
                                      className="gap-1"
                                    >
                                      <BarChart2 className="h-3 w-3" /> Results
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        surveyStore.toggleActive(s.id);
                                        refresh();
                                      }}
                                      className="gap-1 text-xs"
                                    >
                                      <ToggleLeft className="h-3 w-3" />
                                      {s.isActive ? "Close" : "Reopen"}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === "respond" && selectedSurvey && (
            <motion.div
              key="respond"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("list")}
                >
                  ← Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{selectedSurvey.title}</h1>
                </div>
              </div>
              <Card className="glass-card max-w-xl">
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4 py-10 text-center"
                      >
                        <CheckCircle2 className="h-16 w-16 text-green-400" />
                        <h3 className="text-xl font-semibold text-green-400">
                          Thank you!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your feedback has been recorded.
                        </p>
                        <Button onClick={() => setView("list")}>
                          Back to Surveys
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="form" className="space-y-6">
                        {selectedSurvey.description && (
                          <p className="text-sm text-muted-foreground">
                            {selectedSurvey.description}
                          </p>
                        )}
                        {selectedSurvey.questions.map((q, i) => (
                          <div key={q.id} className="space-y-3">
                            <Label className="text-sm font-medium">
                              {i + 1}. {q.text}
                            </Label>
                            {q.type === "rating" && (
                              <StarInput
                                value={(answers[q.id] as number) ?? 0}
                                onChange={(v) =>
                                  setAnswers((a) => ({ ...a, [q.id]: v }))
                                }
                              />
                            )}
                            {q.type === "text" && (
                              <Textarea
                                placeholder="Your response..."
                                rows={2}
                                value={(answers[q.id] as string) ?? ""}
                                onChange={(e) =>
                                  setAnswers((a) => ({
                                    ...a,
                                    [q.id]: e.target.value,
                                  }))
                                }
                              />
                            )}
                            {q.type === "choice" && q.options && (
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      setAnswers((a) => ({ ...a, [q.id]: opt }))
                                    }
                                    className={`p-2 rounded-lg border text-sm text-left transition-all ${answers[q.id] === opt ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"}`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          onClick={handleRespond}
                          disabled={submitting}
                          className="w-full"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Submit Feedback
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {view === "responses" && selectedSurvey && (
            <motion.div
              key="responses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("list")}
                >
                  ← Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    Results: {selectedSurvey.title}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {selectedSurvey.responses.length} total responses
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {selectedSurvey.questions.map((q) => {
                  const qResponses = selectedSurvey.responses
                    .map((r) => r.answers[q.id])
                    .filter(Boolean);
                  const numResponses: number[] = qResponses.map(
                    (v) => Number(v) || 0,
                  );
                  const avgRating =
                    numResponses.length > 0
                      ? numResponses.reduce((a, b) => a + b, 0) /
                        numResponses.length
                      : 0;
                  return (
                    <Card key={q.id} className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{q.text}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {q.type === "rating" && (
                          <div>
                            {qResponses.length > 0 ? (
                              <>
                                <div className="text-3xl font-bold text-yellow-400">
                                  {avgRating.toFixed(1)} / 5
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-4 w-4 ${avgRating >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {qResponses.length} responses
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No responses yet.
                              </p>
                            )}
                          </div>
                        )}
                        {q.type === "choice" && q.options && (
                          <div className="space-y-2">
                            {q.options.map((opt) => {
                              const count = qResponses.filter(
                                (r) => r === opt,
                              ).length;
                              const pct =
                                qResponses.length > 0
                                  ? Math.round(
                                      (count / qResponses.length) * 100,
                                    )
                                  : 0;
                              return (
                                <div key={opt}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>{opt}</span>
                                    <span className="text-muted-foreground">
                                      {count} ({pct}%)
                                    </span>
                                  </div>
                                  <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {q.type === "text" && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {qResponses.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No text responses yet.
                              </p>
                            ) : (
                              qResponses.map((r, i) => (
                                <div
                                  key={i}
                                  className="text-sm p-2 bg-muted/10 rounded"
                                >
                                  {String(r)}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("list")}
                >
                  ← Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Create Survey</h1>
                </div>
              </div>
              <Card className="glass-card max-w-2xl">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label>Survey Title *</Label>
                    <Input
                      placeholder="e.g. Campus Experience Survey"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of this survey..."
                      rows={2}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Questions *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Question
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div
                          key={q.id}
                          className="p-3 bg-muted/10 rounded-lg space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-5">
                              {i + 1}.
                            </span>
                            <Input
                              placeholder="Question text..."
                              value={q.text}
                              onChange={(e) =>
                                updateQuestion(q.id, { text: e.target.value })
                              }
                              className="flex-1"
                            />
                            <Select
                              value={q.type}
                              onValueChange={(v) =>
                                updateQuestion(q.id, {
                                  type: v as SurveyQuestion["type"],
                                })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rating">★ Rating</SelectItem>
                                <SelectItem value="text">✏ Text</SelectItem>
                                <SelectItem value="choice">☑ Choice</SelectItem>
                              </SelectContent>
                            </Select>
                            {questions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeQuestion(q.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {q.type === "choice" && (
                            <Input
                              placeholder="Options (comma-separated): Option A, Option B, Option C"
                              value={
                                q.rawOptions ?? q.options?.join(", ") ?? ""
                              }
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  rawOptions: e.target.value,
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="ml-7"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setView("list")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={
                        creating || !newTitle || questions.some((q) => !q.text)
                      }
                      className="flex-1"
                    >
                      {creating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Create Survey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
