import { Clock, CheckCircle, XCircle, FileCheck, MessageCircle } from "lucide-react";

export const getStatusIcon = (type: string, status: string) => {
  if (type === "complaint") {
    return <MessageCircle className="h-4 w-4 text-purple-600" />;
  }
  if (type === "report") {
    return <FileCheck className="h-4 w-4 text-primary" />;
  }

  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "pending":
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

export const getStatusText = (type: string, status: string) => {
  if (type === "complaint") {
    return status === "pending" ? "На рассмотрении" : 
           status === "approved" ? "Рассмотрена" : "Отклонена";
  }
  if (type === "report") {
    return status === "approved" ? "Принят" : 
           status === "rejected" ? "Отклонен" : "На рассмотрении";
  }
  if (type === "promotion" || type === "application") {
    return status === "approved" ? "Подтверждена. Ожидается тест." : 
           status === "rejected" ? "Отклонена" : "На рассмотрении";
  }
  
  switch (status) {
    case "approved":
      return "Одобрено";
    case "rejected":
      return "Отклонено";
    case "pending":
    default:
      return "На рассмотрении";
  }
};

export const getStatusColor = (type: string, status: string) => {
  if (type === "complaint") {
    return "border-purple-200 bg-purple-50";
  }
  if (type === "report" && status === "approved") {
    return "border-blue-200 bg-blue-50";
  }
  
  switch (status) {
    case "approved":
      return "border-green-200 bg-green-50";
    case "rejected":
      return "border-red-200 bg-red-50";
    case "pending":
    default:
      return "border-yellow-200 bg-yellow-50";
  }
};

export const getStatusTextColor = (type: string, status: string) => {
  if (type === "complaint") {
    return "text-purple-600";
  }
  if (type === "report" && status === "approved") {
    return "text-primary";
  }
  
  switch (status) {
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    case "pending":
    default:
      return "text-yellow-600";
  }
};

export const getAnnouncementBorderColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-l-red-500";
    case "urgent":
      return "border-l-red-600";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-primary";
  }
}; 