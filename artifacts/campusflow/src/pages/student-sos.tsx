import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { sosStore, type SosAlert, type SosType } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  ShieldAlert,
  Zap,
  X,
  History,
} from "lucide-react";

const SOS_TYPES: Array<{
  type: SosType;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}> = [
  {
    type: "Medical Emergency",
    icon: Heart,
    color: "text-red-400",
    bg: "bg-red-500/20 border-red-500/40 hover:bg-red-500/30",
  },
  {
    type: "Fire",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30",
  },
  {
    type: "Security Threat",
    icon: ShieldAlert,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30",
  },
  {
    type: "Electrical Hazard",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30",
  },
  {
    type: "Other",
    icon: AlertTriangle,
    color: "text-purple-400",
    bg: "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30",
  },
];

const statusColor: Record<SosAlert["status"], string> = {
  Active: "bg-red-500/20 text-red-400 border-red-500/30",
  Acknowledged: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Resolved: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function StudentSos() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [phase, setPhase] = useState<"idle" | "form" | "confirmed">("idle");
  const [selectedType, setSelectedType] = useState<SosType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lastAlert, setLastAlert] = useState<SosAlert | null>(null);
  const [history, setHistory] = useState<SosAlert[]>(() =>
    user ? sosStore.getByStudent(user.id) : [],
  );
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    if (!user || !selectedType) return;
    const alert = sosStore.create({
      studentId: user.id,
      studentName: user.name,
      type: selectedType,
      description,
      location,
    });
    addNotification({
      type: "sos_update",
      title: "SOS Alert Sent",
      message: `Your ${selectedType} alert has been dispatched to campus security.`,
    });
    setLastAlert(alert);
    setHistory(sosStore.getByStudent(user.id));
    setPhase("confirmed");
  };

  const reset = () => {
    setPhase("idle");
    setSelectedType(null);
    setDescription("");
    setLocation("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SOS Emergency</h1>
            <p className="text-muted-foreground mt-1">
              Report a campus emergency immediately.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowHistory((v) => !v)}
          >
            <History className="h-4 w-4" />
            {showHistory ? "Hide" : "History"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <Card className="glass-card border-red-500/20 overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPhase("form")}
                    className="w-44 h-44 rounded-full bg-red-500/20 border-4 border-red-500 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_60px_rgba(239,68,68,0.5)] transition-shadow"
                  >
                    <AlertTriangle className="h-16 w-16 text-red-400" />
                    <span className="text-2xl font-black text-red-400 tracking-widest">
                      SOS
                    </span>
                  </motion.button>
                  <p className="text-muted-foreground mt-6 max-w-xs text-sm">
                    Tap the button above to report an emergency. Campus security
                    will be notified immediately.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3">
                {SOS_TYPES.map(({ type, icon: Icon, color, bg }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setPhase("form");
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${bg}`}
                  >
                    <Icon className={`h-6 w-6 ${color}`} />
                    <span className="text-xs font-medium text-center">
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass-card border-red-500/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Report
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={reset}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label className="mb-3 block">Emergency Type *</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {SOS_TYPES.map(({ type, icon: Icon, color, bg }) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-xs font-medium ${bg} ${selectedType === type ? "ring-2 ring-red-500" : ""}`}
                        >
                          <Icon className={`h-5 w-5 ${color}`} />
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Where is the emergency? e.g. Block B, 3rd Floor"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Details</Label>
                    <Textarea
                      placeholder="Briefly describe the situation..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedType}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base h-12"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    SEND EMERGENCY ALERT
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "confirmed" && lastAlert && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass-card border-green-500/30">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="h-20 w-20 text-green-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-400">
                      Alert Sent!
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Your <strong>{lastAlert.type}</strong> alert has been
                      dispatched. Campus security has been notified.
                    </p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-3 w-full text-sm text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alert ID</span>
                      <span className="font-mono text-xs">
                        {lastAlert.id.split("-")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{lastAlert.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>
                        {new Date(lastAlert.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="text-xs border bg-red-500/20 text-red-400 border-red-500/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={reset} className="mt-2">
                    Done
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">My SOS History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No emergency alerts sent.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start justify-between gap-3 p-3 bg-muted/10 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={`text-xs border ${statusColor[alert.status]}`}
                            >
                              {alert.status}
                            </Badge>
                            <span className="text-sm font-medium">
                              {alert.type}
                            </span>
                          </div>
                          {alert.location && (
                            <p className="text-xs text-muted-foreground">
                              {alert.location}
                            </p>
                          )}
                          {alert.description && (
                            <p className="text-xs text-muted-foreground">
                              {alert.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
