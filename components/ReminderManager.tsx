import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Bell, Plus, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { SketchButton } from './SketchButton';

interface ReminderManagerProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onAddReminder,
  onDeleteReminder,
  onUpdateReminder
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      reminders.forEach(reminder => {
        if (reminder.isActive && reminder.scheduledTime <= now) {
          showNotification(reminder);
          onUpdateReminder(reminder.id, { isActive: false });
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // 每10秒檢查一次
    return () => clearInterval(interval);
  }, [reminders, onUpdateReminder]);

  const showNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.id,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !scheduledTime) return;

    try {
      await onAddReminder({
        title: title.trim(),
        message: message.trim(),
        scheduledTime: new Date(scheduledTime).getTime(),
        isActive: true
      });
      setTitle('');
      setMessage('');
      setScheduledTime('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  const activeReminders = reminders.filter(r => r.isActive && r.scheduledTime > Date.now());
  const pastReminders = reminders.filter(r => !r.isActive || r.scheduledTime <= Date.now());

  return (
    <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2">
          <Bell size={28} />
          提醒通知
        </h2>
        <SketchButton
          onClick={() => setShowForm(!showForm)}
          icon={<Plus size={18} />}
          className="!py-1"
        >
          新增提醒
        </SketchButton>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-yellow-50 dark:bg-zinc-700 p-4 rounded-lg border-2 border-ink/20 dark:border-chalk/20">
          <div>
            <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
              標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="提醒標題..."
              className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-600 text-ink dark:text-chalk focus:outline-none focus:ring-2 focus:ring-pencil-blue"
              required
            />
          </div>

          <div>
            <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
              訊息
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="提醒內容..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-600 text-ink dark:text-chalk focus:outline-none focus:ring-2 focus:ring-pencil-blue resize-none"
              required
            />
          </div>

          <div>
            <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
              提醒時間
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-600 text-ink dark:text-chalk focus:outline-none focus:ring-2 focus:ring-pencil-blue"
              required
            />
          </div>

          <div className="flex gap-2">
            <SketchButton type="submit">
              新增
            </SketchButton>
            <SketchButton
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setMessage('');
                setScheduledTime('');
              }}
            >
              取消
            </SketchButton>
          </div>
        </form>
      )}

      {/* 即將到來的提醒 */}
      {activeReminders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-hand font-bold text-ink dark:text-chalk mb-3">
            即將到來
          </h3>
          <div className="space-y-3">
            {activeReminders.map(reminder => (
              <div
                key={reminder.id}
                className="bg-white dark:bg-zinc-700 border-2 border-ink/20 dark:border-chalk/20 rounded-lg p-4 shadow-[2px_2px_0px_0px_currentColor] text-ink dark:text-chalk"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-hand font-bold text-ink dark:text-chalk mb-1">
                      {reminder.title}
                    </h4>
                    <p className="font-hand text-sm text-ink/70 dark:text-chalk/70 mb-2">
                      {reminder.message}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-ink/60 dark:text-chalk/60 font-hand">
                      <Clock size={14} />
                      {format(new Date(reminder.scheduledTime), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors ml-4"
                    title="刪除提醒"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 過去的提醒 */}
      {pastReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-hand font-bold text-ink dark:text-chalk mb-3 opacity-60">
            已完成/過期
          </h3>
          <div className="space-y-3 opacity-60">
            {pastReminders.slice(0, 5).map(reminder => (
              <div
                key={reminder.id}
                className="bg-gray-100 dark:bg-zinc-800 border-2 border-ink/10 dark:border-chalk/10 rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-hand font-bold text-ink dark:text-chalk text-sm">
                      {reminder.title}
                    </h4>
                    <p className="text-xs text-ink/60 dark:text-chalk/60 font-hand">
                      {format(new Date(reminder.scheduledTime), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <p className="text-center text-ink/60 dark:text-chalk/60 font-hand py-8">
          還沒有設定提醒喔!
        </p>
      )}
    </div>
  );
};
