
export class TimeUtils {
    private static readonly CUTOFF_HOUR = 20; // 8 PM

    /**
     * Checks if modification is allowed for a target delivery date.
     * Rule: Changes for Tomorrow allowed only BEFORE 8 PM Today.
     *       Changes for Today/Past are NEVER allowed.
     * @param targetDateStr YYYY-MM-DD
     */
    static isModificationAllowed(targetDateStr: string): boolean {
        const now = new Date();
        // Force IST usage in production? For now, assuming server time is handled via env or offset
        // Ideally use Luxon/Dayjs. Using native Date for zero-dependency Sprint 1.

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(targetDateStr);
        targetDate.setHours(0, 0, 0, 0);

        const diffDays = (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays < 1) {
            // Today or Past: Immutable
            return false;
        }

        if (diffDays === 1) {
            // Tomorrow: strict check time
            return now.getHours() < this.CUTOFF_HOUR;
        }

        // Future (> Tomorrow): Allowed
        return true;
    }
}
