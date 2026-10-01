// Access ends at this local date/time. After it, the whole app shows the suspended view.
export const ACCESS_ENDS_AT = new Date(2026, 8, 30, 23, 59, 59);

export const isAccessSuspended = () => Date.now() > ACCESS_ENDS_AT.getTime();
