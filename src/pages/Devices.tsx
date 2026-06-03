import { useState, useEffect } from 'react';
import { Wifi, Smartphone, Tv, Speaker, Monitor, Watch, Plus, Trash2, Bell, BellOff, Bluetooth } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { IoTDevice, ReminderSchedule } from '../types';

const deviceTypeConfig = {
  smartphone: { label: 'Smartphone', icon: Smartphone, desc: 'Notificações push no celular' },
  smart_speaker: { label: 'Smart Speaker', icon: Speaker, desc: 'Alexa, Google Home, etc.' },
  smart_tv: { label: 'Smart TV', icon: Tv, desc: 'Lembretes na tela da TV' },
  computer: { label: 'Computador', icon: Monitor, desc: 'Notificações no desktop' },
  smartwatch: { label: 'Smartwatch', icon: Watch, desc: 'Vibração no pulso' },
};

const connectionConfig = {
  wifi: { label: 'Wi-Fi', icon: Wifi },
  bluetooth: { label: 'Bluetooth', icon: Bluetooth },
  mqtt: { label: 'MQTT', icon: Wifi },
};

const reminderTypeConfig = {
  checkin: { label: 'Check-in diário', desc: 'Lembrete para fazer seu check-in', color: 'bg-emerald-50 text-emerald-700' },
  module: { label: 'Módulo do dia', desc: 'Hora de aprender algo novo', color: 'bg-blue-50 text-blue-700' },
  hydration: { label: 'Hidratação', desc: 'Beba água como substituto', color: 'bg-cyan-50 text-cyan-700' },
  motivation: { label: 'Motivação', desc: 'Mensagem de encorajamento', color: 'bg-amber-50 text-amber-700' },
};

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDevice, setNewDevice] = useState({ name: '', device_type: 'smartphone', connection_type: 'wifi' });
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    reminder_type: 'checkin',
    scheduled_time: '08:00',
    days_of_week: [1, 2, 3, 4, 5, 6, 7],
    device_id: '',
  });

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const [devRes, remRes] = await Promise.all([
      supabase.from('iot_devices').select('*').eq('user_id', user!.id).eq('is_active', true),
      supabase.from('reminder_schedules').select('*').eq('user_id', user!.id),
    ]);
    setDevices(devRes.data || []);
    setReminders(remRes.data || []);
    setLoading(false);
  }

  async function addDevice() {
    if (!newDevice.name.trim()) return;
    const { data } = await supabase.from('iot_devices').insert({ ...newDevice, user_id: user!.id }).select().maybeSingle();
    if (data) setDevices(prev => [...prev, data]);
    setNewDevice({ name: '', device_type: 'smartphone', connection_type: 'wifi' });
    setShowAddDevice(false);
  }

  async function removeDevice(id: string) {
    await supabase.from('iot_devices').update({ is_active: false }).eq('id', id);
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  async function addReminder() {
    if (!newReminder.title.trim()) return;
    const payload = { ...newReminder, user_id: user!.id, device_id: newReminder.device_id || null };
    const { data } = await supabase.from('reminder_schedules').insert(payload).select().maybeSingle();
    if (data) setReminders(prev => [...prev, data]);
    setShowAddReminder(false);
  }

  async function toggleReminder(id: string, current: boolean) {
    await supabase.from('reminder_schedules').update({ is_active: !current }).eq('id', id);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r));
  }

  async function deleteReminder(id: string) {
    await supabase.from('reminder_schedules').delete().eq('id', id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  function toggleDay(day: number) {
    setNewReminder(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day],
    }));
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dispositivos &amp; Lembretes IoT</h1>
        <p className="text-gray-500 mt-1">Conecte seus dispositivos e configure lembretes inteligentes.</p>
      </div>

      {/* IoT explanation */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Wifi className="text-cyan-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-cyan-800 text-sm mb-1">Como funciona a integração IoT</h3>
            <p className="text-cyan-700 text-xs leading-relaxed">
              Registre seus dispositivos domésticos (smartphone, smart speaker, TV, computador) para receber lembretes personalizados.
              A integração usa MQTT para dispositivos locais e HTTP/WebSocket para serviços cloud (Google Home, Alexa).
              O protocolo MQTT via Mosquitto broker garante baixa latência e funcionamento mesmo com conectividade instável.
            </p>
          </div>
        </div>
      </div>

      {/* Devices section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Meus dispositivos</h2>
          <button
            onClick={() => setShowAddDevice(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Wifi className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500 text-sm">Nenhum dispositivo registrado ainda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(d => {
              const cfg = deviceTypeConfig[d.device_type];
              const connCfg = connectionConfig[d.connection_type];
              return (
                <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <cfg.icon size={18} className="text-gray-600" />
                    </div>
                    <button onClick={() => removeDevice(d.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{d.name}</h3>
                  <p className="text-gray-500 text-xs mt-0.5 mb-3">{cfg.label} · {cfg.desc}</p>
                  <div className="flex items-center gap-1.5">
                    <connCfg.icon size={12} className="text-emerald-500" />
                    <span className="text-xs text-gray-500">{connCfg.label}</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" title="Online" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reminders section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Lembretes agendados</h2>
          <button
            onClick={() => setShowAddReminder(true)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus size={16} /> Novo lembrete
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Bell className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500 text-sm">Sem lembretes configurados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(r => {
              const typeCfg = reminderTypeConfig[r.reminder_type];
              return (
                <div key={r.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${r.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCfg.color}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeCfg.color}`}>{typeCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{r.scheduled_time}</span>
                      <span>{r.days_of_week.map(d => daysOfWeek[d - 1]).join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminder(r.id, r.is_active)} className="text-gray-400 hover:text-emerald-500 transition-colors">
                      {r.is_active ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                    <button onClick={() => deleteReminder(r.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add device modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-5">Adicionar dispositivo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do dispositivo</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={e => setNewDevice(p => ({ ...p, name: e.target.value }))}
                  placeholder="ex: Meu iPhone, Echo Dot sala..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(deviceTypeConfig) as [string, typeof deviceTypeConfig[keyof typeof deviceTypeConfig]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setNewDevice(p => ({ ...p, device_type: key }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${
                        newDevice.device_type === key ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <cfg.icon size={18} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protocolo</label>
                <div className="flex gap-2">
                  {(['wifi', 'bluetooth', 'mqtt'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setNewDevice(p => ({ ...p, connection_type: c }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                        newDevice.connection_type === c ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {connectionConfig[c].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddDevice(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={addDevice} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add reminder modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-5">Novo lembrete</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))}
                  placeholder="ex: Hora do check-in!"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de lembrete</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(reminderTypeConfig) as [string, typeof reminderTypeConfig[keyof typeof reminderTypeConfig]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setNewReminder(p => ({ ...p, reminder_type: key }))}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        newReminder.reminder_type === key ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{cfg.label}</p>
                      <p className="text-gray-500 mt-0.5">{cfg.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Horário</label>
                <input
                  type="time"
                  value={newReminder.scheduled_time}
                  onChange={e => setNewReminder(p => ({ ...p, scheduled_time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
                <div className="flex gap-1.5 flex-wrap">
                  {daysOfWeek.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i + 1)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                        newReminder.days_of_week.includes(i + 1) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              {devices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dispositivo (opcional)</label>
                  <select
                    value={newReminder.device_id}
                    onChange={e => setNewReminder(p => ({ ...p, device_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">Todos os dispositivos</option>
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddReminder(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={addReminder} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
