import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm:ss');
  } catch {
    return dateStr;
  }
};

export const formatRelative = (dateStr) => {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
};

export const formatTime = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'HH:mm');
  } catch {
    return dateStr;
  }
};
