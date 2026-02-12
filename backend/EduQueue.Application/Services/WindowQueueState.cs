namespace EduQueue.Application.Services
{
    public static class WindowQueueState
    {
        private static readonly Dictionary<Guid, bool> _state = new Dictionary<Guid, bool>();

        public static bool WasLastPriority(Guid windowId)
        {
            return _state.TryGetValue(windowId, out bool wasPriority) && wasPriority;
        }

        public static void SetLastPriority(Guid windowId, bool wasPriority)
        {
            _state[windowId] = wasPriority;
        }

        public static void Reset(Guid windowId)
        {
            _state.Remove(windowId);
        }

        public static void Clear()
        {
            _state.Clear();
        }
    }
}
