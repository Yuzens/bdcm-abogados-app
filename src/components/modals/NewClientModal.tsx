import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, UserPlus } from 'lucide-react';
import { ClientType } from '../../types';
import { validateRutCL, formatRutCL, REGIONS_CHILE } from '../../utils/chileanLegal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addClient } = useLegal();

  const [clientType, setClientType] = useState<ClientType>('PERSONA_NATURAL');
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+56 9 ');
  const [address, setAddress] = useState('');
  const [commune, setCommune] = useState('Santiago');
  const [region, setRegion] = useState('Región Metropolitana');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeRut, setRepresentativeRut] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rut.trim() || !name.trim()) {
      alert('Por favor ingrese al menos el RUT y el Nombre del cliente.');
      return;
    }

    if (!validateRutCL(rut)) {
      if (!confirm('El RUT ingresado parece tener un dígito verificador inválido. ¿Desea guardarlo de todas formas?')) {
        return;
      }
    }

    addClient({
      rut: formatRutCL(rut),
      name: name.trim(),
      clientType,
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      commune: commune.trim(),
      region,
      representativeName: clientType === 'PERSONA_JURIDICA' ? representativeName.trim() : undefined,
      representativeRut: clientType === 'PERSONA_JURIDICA' ? representativeRut.trim() : undefined,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <span>Ficha de Nuevo Cliente</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setClientType('PERSONA_NATURAL')}
              className={`py-2 text-center rounded-lg font-semibold transition-colors cursor-pointer ${
                clientType === 'PERSONA_NATURAL'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Persona Natural
            </button>
            <button
              type="button"
              onClick={() => setClientType('PERSONA_JURIDICA')}
              className={`py-2 text-center rounded-lg font-semibold transition-colors cursor-pointer ${
                clientType === 'PERSONA_JURIDICA'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Persona Jurídica / Empresa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                RUT (Chile) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. 12.345.678-9 o 76.123.456-K"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {clientType === 'PERSONA_JURIDICA' ? 'Razón Social' : 'Nombre Completo'}{' '}
                <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder={clientType === 'PERSONA_JURIDICA' ? 'Empresa SpA / Ltda.' : 'Nombre y Apellidos'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
                required
              />
            </div>
          </div>

          {clientType === 'PERSONA_JURIDICA' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Representante Legal (Nombre)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  RUT Representante
                </label>
                <input
                  type="text"
                  placeholder="Ej. 15.678.901-2"
                  value={representativeRut}
                  onChange={(e) => setRepresentativeRut(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="contacto@cliente.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
              <input
                type="text"
                placeholder="+56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Dirección / Calle</label>
              <input
                type="text"
                placeholder="Av. Providencia 1234, Of. 502"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Comuna</label>
              <input
                type="text"
                placeholder="Providencia"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Región</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
            >
              {REGIONS_CHILE.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Observaciones o Antecedentes Comerciales
            </label>
            <textarea
              rows={2}
              placeholder="Notas sobre facturación, órdenes de compra, solvencia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
