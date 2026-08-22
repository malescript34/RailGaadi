import React from "react";
import { RunningStatus } from "@/types";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Clock, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

interface DelayBadgeProps {
  status: RunningStatus;
  delayMinutes: number;
  className?: string;
}

export function DelayBadge({ status, delayMinutes, className }: DelayBadgeProps) {
  let variant: BadgeVariant = "default";
  let label = "ON TIME";
  let Icon = CheckCircle2;

  if (status === "DELAYED" || delayMinutes > 0) {
    variant = "delayed";
    label = delayMinutes > 0 ? `LATE BY ${delayMinutes} MIN` : "DELAYED";
    Icon = AlertTriangle;
  } else if (status === "EARLY" || delayMinutes < 0) {
    variant = "early";
    label = `EARLY BY ${Math.abs(delayMinutes)} MIN`;
    Icon = Clock;
  } else if (status === "AT_STATION") {
    variant = "station";
    label = "AT STATION";
    Icon = PlayCircle;
  } else if (status === "ON_TIME") {
    variant = "ontime";
    label = "ON TIME";
    Icon = CheckCircle2;
  } else if (status === "COMPLETED") {
    variant = "secondary";
    label = "COMPLETED";
    Icon = CheckCircle2;
  }

  return (
    <Badge variant={variant} pulse={status === "DELAYED" || status === "AT_STATION"} className={className}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
