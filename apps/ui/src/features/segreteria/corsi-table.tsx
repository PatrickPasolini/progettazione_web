import { useState } from 'react';
import { fetchApi } from '../shared/api';
import { degreeCode, degreeLabel } from '../shared/data';
import { Modal } from '../shared/ui/components';
import { PlusIcon } from '../shared/ui/icons';
import type { Degree } from '../shared/types';

interface CorsiTableProps {
  degrees: Degree[];
  onChanged: () => void;
}

interface DegreeForm {
  degreeName: string;
  degreeType: string;
  degreeYear: string;
}

const DEGREE_TYPES = ['LT', 'LM', 'LMCU'];
const DEGREE_YEARS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const emptyForm = (): DegreeForm => ({ degreeName: '', degreeType: 'LT', degreeYear: 'I' });

export function CorsiTable({ degrees, onChanged }: CorsiTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Degree | null>(null);
  const [form, setForm] = useState<DegreeForm>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  }

  function openEdit(d: Degree) {
    setEditing(d);
    setForm({ degreeName: d.degreeName, degreeType: d.degreeType, degreeYear: d.degreeYear });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editing) {
        await fetchApi(`/degree/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await fetchApi('/degree', { method: 'POST', body: JSON.stringify(form) });
      }
      setModalOpen(false);
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn primary" onClick={openAdd}>
          <PlusIcon size={14} /> Aggiungi corso di laurea
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Anno</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {degrees.map(d => (
            <tr key={d.id}>
              <td><span className="code">{degreeCode(d.degreeName, d.degreeType, d.degreeYear)}</span></td>
              <td>{d.degreeName}</td>
              <td>{d.degreeType}</td>
              <td>{d.degreeYear}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn-ghost" onClick={() => openEdit(d)}>
                  Modifica
                </button>
              </td>
            </tr>
          ))}
          {degrees.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
                Nessun corso di laurea
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifica corso di laurea' : 'Nuovo corso di laurea'}
        subtitle={editing ? degreeLabel(editing.degreeName, editing.degreeType, editing.degreeYear) : undefined}
        foot={
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>
              Annulla
            </button>
            <button type="submit" form="degree-form" className="btn primary" disabled={loading}>
              {loading ? 'Salvataggio…' : editing ? 'Salva modifiche' : 'Crea'}
            </button>
          </div>
        }
      >
        <form id="degree-form" onSubmit={handleSubmit}>
          {error && (
            <div className="banner warn" style={{ marginBottom: 16 }}>
              <span className="pill">Errore</span>
              <span>{error}</span>
            </div>
          )}
          <div className="field">
            <label>Nome corso di laurea</label>
            <input
              type="text"
              value={form.degreeName}
              onChange={e => setForm(f => ({ ...f, degreeName: e.target.value }))}
              placeholder="es. Informatica"
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Tipo</label>
              <select value={form.degreeType} onChange={e => setForm(f => ({ ...f, degreeType: e.target.value }))}>
                {DEGREE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Anno</label>
              <select value={form.degreeYear} onChange={e => setForm(f => ({ ...f, degreeYear: e.target.value }))}>
                {DEGREE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
