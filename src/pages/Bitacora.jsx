// Contenido COMPLETO Y ACTUALIZADO para: rm-frontend/src/pages/Bitacora.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

// --- Componente para el Estado Vacío (sin cambios) ---
const EmptyState = () => (
  <div className="text-center bg-gray-100 p-8 rounded-lg border-2 border-dashed">
    <h3 className="text-xl font-bold text-gray-800">¡Aquí comienza tu transformación!</h3>
    <p className="text-gray-600 mt-2 mb-6 max-w-lg mx-auto">
      Esta bitácora es tu herramienta más poderosa. Registrar tu peso, medidas y sensaciones cada semana te permitirá ver patrones, celebrar victorias y mantenerte enfocado en el objetivo.
    </p>
    <div className="border-t border-gray-300 pt-6">
      <p className="text-sm font-semibold text-gray-500 mb-2">ASÍ SE VERÁ TU PRIMER REGISTRO:</p>
      <div className="bg-white p-4 rounded-lg shadow-md text-left opacity-60">
        <p className="text-sm text-gray-400">Fecha de tu registro</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div><strong>Peso:</strong> 85.0 kg</div>
          <div><strong>Cintura:</strong> 95.0 cm</div>
          <div><strong>Energía:</strong> 4/5</div>
          <div><strong>Sueño:</strong> 4/5</div>
        </div>
        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded"><strong>Notas:</strong> ¡Primera semana completada! Me siento con más energía.</p>
      </div>
    </div>
  </div>
);

// --- Componente: MODAL DE EDICIÓN (sin cambios) ---
const EditModal = ({ log, onClose, onSave }) => {
  const [formData, setFormData] = useState(log);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Registro</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="edit_weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
            <input type="number" step="0.1" id="edit_weight" name="weight" value={formData.weight} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="edit_waist" className="block text-sm font-medium text-gray-700">Cintura (cm)</label>
            <input type="number" step="0.1" id="edit_waist" name="waist" value={formData.waist} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="edit_notes" className="block text-sm font-medium text-gray-700">Notas / Sensaciones</label>
            <textarea id="edit_notes" name="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Bitacora = () => {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLog, setEditingLog] = useState(null);

  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      // Si no hay usuario, no hacemos nada y terminamos de cargar.
      if (!user) {
        console.log("Bitacora: No hay usuario, deteniendo fetch.");
        setLoading(false);
        return;
      }
      
      console.log("Bitacora: Usuario detectado, iniciando fetch de registros para user_id:", user.id);
      setLoading(true);
      setError(null);

      try {
        const { data, error, status } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log("Bitacora: Respuesta de Supabase recibida.", { data, error, status });

        if (error && status !== 406) { // 406 es un error común y a veces benigno, lo ignoramos si hay datos.
          throw error;
        }

        if (data) {
          setLogs(data);
        }
      } catch (error) {
        console.error("Bitacora: Error al cargar los registros:", error);
        setError(`Error al cargar el historial: ${error.message}`);
      } finally {
        console.log("Bitacora: Fetch finalizado, setLoading(false).");
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]); // El efecto se ejecuta cada vez que el objeto 'user' cambia.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase.from('progress_logs').insert([{ user_id: user.id, weight: parseFloat(weight), waist: parseFloat(waist), energy_level: parseInt(energyLevel), sleep_quality: parseInt(sleepQuality), notes: notes, }]);
      if (error) throw error;
      setWeight(''); setWaist(''); setEnergyLevel(3); setSleepQuality(3); setNotes('');
      // En lugar de llamar a fetchLogs() de nuevo, simplemente añadimos el nuevo log al principio de la lista.
      // Esto es más eficiente, pero por ahora mantenemos fetchLogs() para asegurar consistencia.
      await (async () => {
        const { data } = await supabase.from('progress_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setLogs(data);
      })();
    } catch (error) { setError(error.message); } 
    finally { setSubmitting(false); }
  };

  const handleDelete = async (logId) => {
    if (window.confirm('¿Estás seguro de que deseas borrar este registro? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase.from('progress_logs').delete().match({ id: logId });
        if (error) throw error;
        setLogs(logs.filter(log => log.id !== logId)); // Actualización optimista
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleUpdate = async (updatedLog) => {
    try {
      const { id, created_at, user_id, ...fieldsToUpdate } = updatedLog;
      const { error } = await supabase.from('progress_logs').update(fieldsToUpdate).match({ id: id });
      if (error) throw error;
      // Actualización optimista para una UI más rápida
      setLogs(logs.map(log => log.id === id ? { ...log, ...fieldsToUpdate } : log));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-full">
      {editingLog && <EditModal log={editingLog} onClose={() => setEditingLog(null)} onSave={handleUpdate} />}

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Bitácora de Progreso</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-2xl mx-auto">Registra, edita y gestiona tus avances semanales para ser testigo de tu transformación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label><input type="number" step="0.1" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" /></div>
              <div><label htmlFor="waist" className="block text-sm font-medium text-gray-700">Cintura (cm)</label><input type="number" step="0.1" id="waist" value={waist} onChange={(e) => setWaist(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" /></div>
              <div><label htmlFor="energy" className="block text-sm font-medium text-gray-700">Nivel de Energía (1-5)</label><input type="range" min="1" max="5" id="energy" value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="text-center text-sm text-gray-500">{energyLevel}</div></div>
              <div><label htmlFor="sleep" className="block text-sm font-medium text-gray-700">Calidad del Sueño (1-5)</label><input type="range" min="1" max="5" id="sleep" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="text-center text-sm text-gray-500">{sleepQuality}</div></div>
              <div><label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas / Sensaciones</label><textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"></textarea></div>
              <button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors">{submitting ? 'Guardando...' : 'Guardar Registro'}</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg min-h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Registros</h2>
            {loading && <p>Cargando historial...</p>}
            {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}
            {!loading && !error && logs.length === 0 && <EmptyState />}
            {!loading && !error && logs.length > 0 && (
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="border-b pb-4 flex flex-col">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <div className="space-x-2">
                        <button onClick={() => setEditingLog(log)} className="text-sm text-blue-600 hover:underline">Editar</button>
                        <button onClick={() => handleDelete(log.id)} className="text-sm text-red-600 hover:underline">Borrar</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div><strong>Peso:</strong> {log.weight} kg</div>
                      <div><strong>Cintura:</strong> {log.waist} cm</div>
                      <div><strong>Energía:</strong> {log.energy_level}/5</div>
                      <div><strong>Sueño:</strong> {log.sleep_quality}/5</div>
                    </div>
                    {log.notes && <p className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded"><strong>Notas:</strong> {log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;
