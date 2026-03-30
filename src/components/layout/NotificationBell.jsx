import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiCheck, FiInfo } from 'react-icons/fi'
import { notificationsAPI } from '../../utils/api'

function formatTime(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await notificationsAPI.list({ limit: 8 })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
    } catch {
      // no-op
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
        aria-label="Notifications"
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400">Recent platform updates</p>
            </div>
            <button type="button" onClick={markAllRead} className="text-xs font-semibold text-primary-700">
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-gray-500">
                <FiInfo className="text-gray-300" size={20} />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const content = (
                  <div className={`border-b border-gray-50 px-4 py-3 transition-colors hover:bg-slate-50 ${item.isRead ? '' : 'bg-primary-50/60'}`}>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      {!item.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />}
                    </div>
                    <p className="text-xs leading-5 text-gray-600">{item.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">{formatTime(item.createdAt)}</span>
                      {item.link ? <span className="text-[11px] font-semibold text-primary-700">Open</span> : null}
                    </div>
                  </div>
                )

                return item.link ? (
                  <Link key={item._id} to={item.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={item._id}>{content}</div>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2 text-xs text-gray-500">
              <span>
                {notifications.length} recent item{notifications.length === 1 ? '' : 's'}
              </span>
              <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 font-semibold text-primary-700">
                <FiCheck size={12} /> Clear unread badge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
