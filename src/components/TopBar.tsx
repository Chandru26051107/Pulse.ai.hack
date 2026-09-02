import { useCurrentStatus, usePrediction } from "@/hooks/usePulseFlow";
import {
  getRiskColor,
  getRiskEmoji,
} from "@/types/pulseflow";
import { Clock, Users, Bed, AlertTriangle } from "lucide-react";

export function TopBar() {
  const status = useCurrentStatus();
  const prediction = usePrediction();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium tabular-nums">{timeStr}</span>
        </div>
        <div className="vintage-divider w-px h-5 bg-border" />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium text-foreground">
              {status.data.currentEDPatients}
            </span>
            patients
          </span>
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium text-foreground">
              {status.data.availableBeds}
            </span>
            beds free
          </span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium text-foreground">
              {status.data.averageWaitingTime}min
            </span>
            wait
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/50">
          <span className="text-sm">{getRiskEmoji(prediction.riskLevel)}</span>
          <span
            className="text-xs font-semibold"
            style={{ color: getRiskColor(prediction.riskLevel) }}
          >
            {prediction.riskLevel}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round(prediction.probability * 100)}%
          </span>
        </div>
      </div>
    </header>
  );
}
