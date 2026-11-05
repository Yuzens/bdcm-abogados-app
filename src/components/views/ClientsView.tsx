import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Briefcase,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { formatRutCL } from '../../utils/chileanLegal';

interface Props {
  onOpenNewClient: () => void;
  onOpenNewCaseForClient: (clientId: string) => void;
}

export const ClientsView: React.FC<Props> = ({
  onOpenNewClient,
  onOpenNewCaseForClient,
}) => {
  const { clients, cases, deleteClient, searchQuery } = useLegal();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.rut.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId) || filteredClients[0];
  const clientCases = selectedClient ? cases.filter((c) => c.clientId === selectedClient.id) : [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Clientes & Fichas de Contacto
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro de personas naturales y jurídicas con RUT chileno validado
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clients List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
              No se encontraron clientes registrados.
            </div>
          ) : (
            filteredClients.map((cli) => {
              const isSelected = selectedClient?.id === cli.id;
              const activeCount = cases.filter((c) => c.clientId === cli.id).length;

              return (
                <div
                  key={cli.id}
                  onClick={() => setSelectedClientId(cli.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono-legal text-emerald-400">
                      {formatRutCL(cli.rut)}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {cli.clientType === 'PERSONA_JURIDICA' ? 'Empresa' : 'Persona'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100">{cli.name}</h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{cli.email}</span>
                    <span className="text-slate-300 font-semibold">{activeCount} causa(s)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Client Detail */}
        <div className="lg:col-span-7">
          {selectedClient ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono-legal text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      {formatRutCL(selectedClient.rut)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedClient.clientType === 'PERSONA_JURIDICA' ? 'Persona Jurídica' : 'Persona Natural'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-legal-heading text-slate-100">
                    {selectedClient.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNewCaseForClient(selectedClient.id)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Nueva Causa</span>
                  </button>
                  <button
                    onClick={() => deleteClient(selectedClient.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-emerald-400" />
                    Correo Electrónico:
                  </span>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="text-slate-200 hover:text-emerald-400 font-semibold block underline"
                  >
                    {selectedClient.email}
                  </a>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    Teléfono Móvil:
                  </span>
                  <a
                    href={`tel:${selectedClient.phone}`}
                    className="text-slate-200 hover:text-emerald-400 font-semibold block"
                  >
                    {selectedClient.phone}
                  </a>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    Domicilio & Comuna:
                  </span>
                  <p className="text-slate-200 font-semibold">
                    {selectedClient.address}, {selectedClient.commune}
                  </p>
                  <p className="text-[11px] text-slate-400">{selectedClient.region}</p>
                </div>

                {selectedClient.clientType === 'PERSONA_JURIDICA' && (
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-400" />
                      Representante Legal:
                    </span>
                    <p className="text-slate-200 font-semibold">
                      {selectedClient.representativeName || 'No indicado'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono-legal">
                      RUT: {selectedClient.representativeRut || 'S/N'}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Observaciones Confidenciales:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedClient.notes}</p>
                </div>
              )}

              {/* Associated Cases */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Causas Judiciales del Cliente ({clientCases.length})
                </span>

                {clientCases.length === 0 ? (
                  <div className="p-4 text-center bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                    Este cliente aún no tiene causas vinculadas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientCases.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-legal text-amber-400 font-bold">{c.rol}</span>
                            <span className="text-slate-400 text-[11px]">• {c.court}</span>
                          </div>
                          <p className="font-semibold text-slate-200 mt-0.5">{c.caratula}</p>
                        </div>
                        <span className="text-[10px] font-mono-legal uppercase px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
              Seleccione un cliente para ver su ficha completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
