import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRoom?: (roomId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToRoom,
}) => {
  const { alerts, rooms } = useData();

  if (!isOpen) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🔴 Khẩn cấp</span>;
      case 'warning':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🟠 Cần xử lý</span>;
      case 'info':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🟡 Cần chú ý</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🟢 Hoàn thành</span>;
    }
  };

  const completedRooms = rooms.filter(r => r.morningAttendanceDone && r.eveningAttendanceDone);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Thông Báo & Cảnh Báo
              {alerts.length > 0 && (
                <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-extrabold">
                  {alerts.length}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tiến độ điểm danh và nề nếp toàn trường</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Priority Alerts */}
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition ${
                alert.type === 'urgent'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-blue-50/80 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-xs">{alert.title}</h4>
                    {getAlertBadge(alert.type)}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>

                  {alert.targetRoomId && onNavigateToRoom && (
                    <button
                      onClick={() => {
                        onNavigateToRoom(alert.targetRoomId!);
                        onClose();
                      }}
                      className="mt-2 text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Đến phòng kiểm tra <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Completed notification summary */}
          {completedRooms.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs">Phòng đã hoàn thành đủ sáng & tối</h4>
                    {getAlertBadge('success')}
                  </div>
                  <p className="text-xs text-slate-700">
                    {completedRooms.length}/{rooms.length} phòng ({completedRooms.map(r => r.roomNumber).join(', ')}) đã nộp đủ điểm danh sáng và tối đúng giờ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {alerts.length === 0 && completedRooms.length === rooms.length && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Tất cả dữ liệu đã hoàn thành tốt!</div>
              <div className="text-xs mt-1">Không có cảnh báo khẩn cấp nào tại thời điểm này.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tự động cập nhật mỗi khi giáo viên nộp</span>
          <button onClick={onClose} className="font-bold text-blue-600 hover:underline">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
