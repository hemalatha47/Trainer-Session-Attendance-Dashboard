/**
 * OverlayDemo.jsx
 * Development-only showcase for all overlay components.
 * (Module 3.6 Part 2 — Modal, ConfirmDialog)
 * (Module 3.6 Part 3 — Drawer, LoadingOverlay)
 * (Module 3.6 Part 4 — Toast, ToastContainer, OverlayProvider) ← updated
 *
 * This page is NOT wired into ProtectedRoute — viewable without auth.
 * Remove or gate behind a DEV flag before production deployment.
 *
 * NOTE: This page must be rendered inside <OverlayProvider> for the
 * Toast section to function. Wrap at the router level or in App.jsx.
 */

import { useState } from 'react';
import {
  Trash2, Edit, Plus, Info, PanelLeft, PanelRight,
  Loader2, LayoutGrid, Bell, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { Button }  from '@components/ui/Button';
import {
  Modal, ConfirmDialog, Drawer, LoadingOverlay,
} from '@components/overlay';
import { useOverlay } from '@hooks/useOverlay';

// ── Demo section wrapper ─────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-500 mb-4 pb-2 border-b border-secondary-200">
      {title}
    </h2>
    <div className="flex flex-wrap gap-3">
      {children}
    </div>
  </div>
);

// ── Shared content helpers ───────────────────────────────────────────────────
const SampleForm = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1">Student Name</label>
      <input type="text" placeholder="Enter full name"
        className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent" />
    </div>
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1">Student Code</label>
      <input type="text" placeholder="NM2026001"
        className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent" />
    </div>
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1">Email Address</label>
      <input type="email" placeholder="student@example.com"
        className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent" />
    </div>
  </div>
);

const LongContent = () => (
  <div className="space-y-3 text-sm text-secondary-700 leading-relaxed">
    {Array.from({ length: 10 }, (_, i) => (
      <p key={i}>
        Paragraph {i + 1} — long content to verify the scrollable body area works
        correctly when content exceeds the viewport height. Header stays fixed
        while this content scrolls independently.
      </p>
    ))}
  </div>
);

const DrawerContent = () => (
  <div className="space-y-5">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-3">Filter by Status</p>
      <div className="space-y-2">
        {['Active', 'Completed', 'Upcoming'].map((label) => (
          <label key={label} className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="rounded border-secondary-300 text-accent-600 focus:ring-accent-600" />
            <span className="text-sm text-secondary-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-3">Attendance Range</p>
      <div className="space-y-2">
        {['≥ 75% (On Track)', '50–74% (At Risk)', '< 50% (Critical)'].map((label) => (
          <label key={label} className="flex items-center gap-2.5 cursor-pointer">
            <input type="radio" name="range" className="border-secondary-300 text-accent-600 focus:ring-accent-600" />
            <span className="text-sm text-secondary-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-3">Trainer</p>
      <select className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent">
        <option>All Trainers</option>
        <option>Trainer One</option>
        <option>Training Manager</option>
      </select>
    </div>
    <div className="pt-2 flex gap-2">
      <Button variant="primary"   size="sm" fullWidth>Apply Filters</Button>
      <Button variant="secondary" size="sm" fullWidth>Reset</Button>
    </div>
  </div>
);

// ── Toast demo section — uses useOverlay ─────────────────────────────────────
const ToastDemoSection = ({ addLog }) => {
  const { showToast, success, error, warning, info, clearToasts } = useOverlay();

  const fireSuccess = () => {
    success('Attendance marked successfully.', { title: 'Saved' });
    addLog('Toast → success fired');
  };

  const fireError = () => {
    error('Could not save. Please try again.', { title: 'Save Error', duration: 5000 });
    addLog('Toast → error fired (5s)');
  };

  const fireWarning = () => {
    warning('Student attendance is below 75%.', { title: 'Low Attendance' });
    addLog('Toast → warning fired');
  };

  const fireInfo = () => {
    info('Attendance already marked for this date.');
    addLog('Toast → info fired');
  };

  const fireQueue = () => {
    setTimeout(() => success('Step 1 complete.', { title: 'Progress' }), 0);
    setTimeout(() => info('Processing step 2…'),                          400);
    setTimeout(() => warning('Step 3 requires attention.'),               800);
    setTimeout(() => error('Step 4 failed — retrying.', { title: 'Error', duration: 5000 }), 1200);
    addLog('Toast → 4-toast queue fired');
  };

  const fireAutoDismiss = () => {
    showToast({ type: 'success', title: 'Auto-Dismiss', message: 'This toast closes in 2 seconds.', duration: 2000 });
    addLog('Toast → auto-dismiss (2s) fired');
  };

  const fireManualOnly = () => {
    showToast({ type: 'info', title: 'Manual Close', message: 'This toast must be closed manually.', duration: 0 });
    addLog('Toast → manual-close (duration: 0) fired');
  };

  return (
    <>
      {/* Types */}
      <Section title="Toast — Type Variants">
        <Button variant="secondary" size="sm" iconLeft={<CheckCircle2 className="w-3.5 h-3.5 text-success-DEFAULT" />} onClick={fireSuccess}>
          Success
        </Button>
        <Button variant="secondary" size="sm" iconLeft={<XCircle className="w-3.5 h-3.5 text-danger-DEFAULT" />} onClick={fireError}>
          Error (5 s)
        </Button>
        <Button variant="secondary" size="sm" iconLeft={<AlertTriangle className="w-3.5 h-3.5 text-warning-text" />} onClick={fireWarning}>
          Warning
        </Button>
        <Button variant="secondary" size="sm" iconLeft={<Info className="w-3.5 h-3.5 text-accent-600" />} onClick={fireInfo}>
          Info
        </Button>
      </Section>

      {/* Queue & dismissal */}
      <Section title="Toast — Queue &amp; Dismissal Behaviour">
        <Button variant="secondary" size="sm" iconLeft={<Bell className="w-3.5 h-3.5" />} onClick={fireQueue}>
          Fire 4-toast queue
        </Button>
        <Button variant="secondary" size="sm" iconLeft={<Bell className="w-3.5 h-3.5" />} onClick={fireAutoDismiss}>
          Auto-dismiss (2 s)
        </Button>
        <Button variant="secondary" size="sm" iconLeft={<Bell className="w-3.5 h-3.5" />} onClick={fireManualOnly}>
          Manual close only
        </Button>
        <Button variant="danger" size="sm" onClick={() => { clearToasts(); addLog('Toast → all cleared'); }}>
          Clear all toasts
        </Button>
      </Section>
    </>
  );
};

// ── Main demo component ──────────────────────────────────────────────────────
const OverlayDemo = () => {
  // ── Modal states ──────────────────────────────────────────────────────
  const [modalSm, setModalSm]                           = useState(false);
  const [modalMd, setModalMd]                           = useState(false);
  const [modalLg, setModalLg]                           = useState(false);
  const [modalXl, setModalXl]                           = useState(false);
  const [modalNoFooter, setModalNoFooter]               = useState(false);
  const [modalScroll, setModalScroll]                   = useState(false);
  const [modalNoBackdropClose, setModalNoBackdropClose] = useState(false);

  // ── ConfirmDialog states ──────────────────────────────────────────────
  const [confirmDefault, setConfirmDefault] = useState(false);
  const [confirmDanger, setConfirmDanger]   = useState(false);
  const [confirmWarning, setConfirmWarning] = useState(false);

  // ── Drawer states ─────────────────────────────────────────────────────
  const [drawerLeftSm, setDrawerLeftSm]   = useState(false);
  const [drawerLeftMd, setDrawerLeftMd]   = useState(false);
  const [drawerLeftLg, setDrawerLeftLg]   = useState(false);
  const [drawerRightSm, setDrawerRightSm] = useState(false);
  const [drawerRightMd, setDrawerRightMd] = useState(false);
  const [drawerRightLg, setDrawerRightLg] = useState(false);

  // ── LoadingOverlay states ─────────────────────────────────────────────
  const [loadingFullscreen, setLoadingFullscreen]     = useState(false);
  const [loadingFullscreenLg, setLoadingFullscreenLg] = useState(false);
  const [loadingContainer, setLoadingContainer]       = useState(false);

  // ── Action log ────────────────────────────────────────────────────────
  const [log, setLog] = useState([]);
  const addLog = (msg) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);

  const triggerTimedLoading = (setter, label) => {
    setter(true);
    addLog(`${label} → started`);
    setTimeout(() => { setter(false); addLog(`${label} → finished`); }, 2000);
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded-full mb-3">
            <Info className="w-3 h-3" />
            Development Only — Module 3.6 Parts 2, 3 &amp; 4
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Overlay Component Demo</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Modal · ConfirmDialog · Drawer · LoadingOverlay · Toast — all sizes, variants, and behaviours.
          </p>
        </div>

        {/* ── Toast demos (Part 4) ─────────────────────────────────────── */}
        <ToastDemoSection addLog={addLog} />

        {/* ── Modal: sizes ────────────────────────────────────────────── */}
        <Section title="Modal — Size Variants">
          <Button variant="secondary" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalSm(true)}>sm</Button>
          <Button variant="secondary" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalMd(true)}>md (default)</Button>
          <Button variant="secondary" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalLg(true)}>lg</Button>
          <Button variant="secondary" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalXl(true)}>xl</Button>
        </Section>

        {/* ── Modal: behaviour ────────────────────────────────────────── */}
        <Section title="Modal — Behaviour Variants">
          <Button variant="secondary" size="sm" iconLeft={<Edit className="w-3.5 h-3.5" />} onClick={() => setModalNoFooter(true)}>No footer</Button>
          <Button variant="secondary" size="sm" iconLeft={<Edit className="w-3.5 h-3.5" />} onClick={() => setModalScroll(true)}>Long scrollable body</Button>
          <Button variant="secondary" size="sm" iconLeft={<Edit className="w-3.5 h-3.5" />} onClick={() => setModalNoBackdropClose(true)}>Backdrop click disabled</Button>
        </Section>

        {/* ── ConfirmDialog ────────────────────────────────────────────── */}
        <Section title="ConfirmDialog — Variants">
          <Button variant="outline"    size="sm" onClick={() => setConfirmDefault(true)}>Default</Button>
          <Button variant="danger"     size="sm" iconLeft={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setConfirmDanger(true)}>Danger</Button>
          <Button variant="secondary"  size="sm" onClick={() => setConfirmWarning(true)}>Warning</Button>
        </Section>

        {/* ── Drawer: left ────────────────────────────────────────────── */}
        <Section title="Drawer — Left Position">
          <Button variant="secondary" size="sm" iconLeft={<PanelLeft className="w-3.5 h-3.5" />} onClick={() => setDrawerLeftSm(true)}>sm</Button>
          <Button variant="secondary" size="sm" iconLeft={<PanelLeft className="w-3.5 h-3.5" />} onClick={() => setDrawerLeftMd(true)}>md (default)</Button>
          <Button variant="secondary" size="sm" iconLeft={<PanelLeft className="w-3.5 h-3.5" />} onClick={() => setDrawerLeftLg(true)}>lg</Button>
        </Section>

        {/* ── Drawer: right ───────────────────────────────────────────── */}
        <Section title="Drawer — Right Position">
          <Button variant="secondary" size="sm" iconLeft={<PanelRight className="w-3.5 h-3.5" />} onClick={() => setDrawerRightSm(true)}>sm</Button>
          <Button variant="secondary" size="sm" iconLeft={<PanelRight className="w-3.5 h-3.5" />} onClick={() => setDrawerRightMd(true)}>md (default)</Button>
          <Button variant="secondary" size="sm" iconLeft={<PanelRight className="w-3.5 h-3.5" />} onClick={() => setDrawerRightLg(true)}>lg</Button>
        </Section>

        {/* ── LoadingOverlay: fullscreen ───────────────────────────────── */}
        <Section title="LoadingOverlay — Fullscreen Mode">
          <Button variant="secondary" size="sm" iconLeft={<Loader2 className="w-3.5 h-3.5" />}
            onClick={() => triggerTimedLoading(setLoadingFullscreen, 'LoadingOverlay fullscreen md')}>
            md — 2 s auto-dismiss
          </Button>
          <Button variant="secondary" size="sm" iconLeft={<Loader2 className="w-3.5 h-3.5" />}
            onClick={() => triggerTimedLoading(setLoadingFullscreenLg, 'LoadingOverlay fullscreen lg')}>
            lg — 2 s auto-dismiss
          </Button>
        </Section>

        {/* ── LoadingOverlay: container ────────────────────────────────── */}
        <Section title="LoadingOverlay — Container Mode">
          <Button variant="secondary" size="sm" iconLeft={<LayoutGrid className="w-3.5 h-3.5" />}
            onClick={() => triggerTimedLoading(setLoadingContainer, 'LoadingOverlay container')}>
            Container — 2 s auto-dismiss
          </Button>
        </Section>

        {/* Container mode demo card */}
        <div className="relative rounded-xl border border-secondary-200 bg-white shadow-sm p-6 min-h-[140px] mb-10">
          <LoadingOverlay isOpen={loadingContainer} fullscreen={false} message="Fetching students…" size="md" />
          <p className="text-sm font-medium text-secondary-700 mb-1">Student List Card</p>
          <p className="text-xs text-secondary-400">
            Container-mode LoadingOverlay is absolutely positioned within this card.
            Click "Container — 2 s auto-dismiss" above to see it overlay only this element.
          </p>
          <div className="mt-4 space-y-2">
            {['Arun Kumar', 'Divya Priya', 'Manoj Raj'].map((n) => (
              <div key={n} className="flex items-center gap-2 text-sm text-secondary-700">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700">{n[0]}</div>
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* ── Action log ───────────────────────────────────────────────── */}
        {log.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-500 mb-3">Action Log</h2>
            <div className="bg-secondary-900 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 max-h-48 overflow-y-auto">
              {log.map((entry, i) => <div key={i}>{entry}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Modal instances
      ════════════════════════════════════════════════════════════════ */}

      <Modal isOpen={modalSm} onClose={() => { setModalSm(false); addLog('Modal sm → closed'); }} title="Small Modal" size="sm"
        footer={<><Button variant="secondary" size="sm" onClick={() => setModalSm(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={() => { setModalSm(false); addLog('Modal sm → confirmed'); }}>Confirm</Button></>}>
        <p className="text-sm text-secondary-700">Small modal (max-w-sm). Suitable for brief confirmations or compact alerts.</p>
      </Modal>

      <Modal isOpen={modalMd} onClose={() => { setModalMd(false); addLog('Modal md → closed'); }} title="Add New Student" size="md"
        footer={<><Button variant="secondary" size="sm" onClick={() => setModalMd(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={() => { setModalMd(false); addLog('Modal md → saved'); }}>Save Student</Button></>}>
        <SampleForm />
      </Modal>

      <Modal isOpen={modalLg} onClose={() => { setModalLg(false); addLog('Modal lg → closed'); }} title="Edit Batch Details" size="lg"
        footer={<><Button variant="secondary" size="sm" onClick={() => setModalLg(false)}>Discard</Button><Button variant="primary" size="sm" onClick={() => { setModalLg(false); addLog('Modal lg → saved'); }}>Save Changes</Button></>}>
        <div className="space-y-4">
          <SampleForm />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
            <textarea rows={3} placeholder="Batch description…"
              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalXl} onClose={() => { setModalXl(false); addLog('Modal xl → closed'); }} title="Student Attendance Overview" size="xl"
        footer={<><Button variant="secondary" size="sm" onClick={() => setModalXl(false)}>Close</Button><Button variant="primary" size="sm" onClick={() => { setModalXl(false); addLog('Modal xl → exported'); }}>Export CSV</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-secondary-600">Extra-large (max-w-2xl) for wide tables, multi-column forms, or summary views.</p>
          <div className="overflow-x-auto rounded border border-secondary-200">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary-50">
                <tr>{['Student','Code','Sessions','Present','Absent','Attendance %'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {[['Arun Kumar','NM2026001',20,18,2,'90%'],['Divya Priya','NM2026002',20,15,5,'75%'],['Manoj Raj','NM2026003',20,12,8,'60%']].map(([name,code,s,p,a,pct]) => (
                  <tr key={code} className="hover:bg-secondary-50">
                    <td className="px-3 py-2 font-medium text-secondary-900">{name}</td>
                    <td className="px-3 py-2 text-secondary-500">{code}</td>
                    <td className="px-3 py-2 text-secondary-700">{s}</td>
                    <td className="px-3 py-2 text-green-700">{p}</td>
                    <td className="px-3 py-2 text-red-700">{a}</td>
                    <td className="px-3 py-2 font-semibold text-secondary-900">{pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalNoFooter} onClose={() => { setModalNoFooter(false); addLog('Modal (no footer) → closed'); }} title="Information" size="md">
        <p className="text-sm text-secondary-700">No footer slot — the close button in the header is the only dismiss mechanism.</p>
      </Modal>

      <Modal isOpen={modalScroll} onClose={() => { setModalScroll(false); addLog('Modal (scroll) → closed'); }} title="Long Content Test" size="md"
        footer={<Button variant="primary" size="sm" onClick={() => setModalScroll(false)}>Got it</Button>}>
        <LongContent />
      </Modal>

      <Modal isOpen={modalNoBackdropClose}
        onClose={() => { setModalNoBackdropClose(false); addLog('Modal (no backdrop) → closed via X'); }}
        title="Backdrop Click Disabled" size="md" closeOnBackdropClick={false}
        footer={<><Button variant="secondary" size="sm" onClick={() => setModalNoBackdropClose(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={() => { setModalNoBackdropClose(false); addLog('Modal (no backdrop) → confirmed'); }}>OK</Button></>}>
        <p className="text-sm text-secondary-700">Backdrop click will NOT close this modal. Use ✕ or the footer buttons. ESC still works.</p>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          ConfirmDialog instances
      ════════════════════════════════════════════════════════════════ */}

      <ConfirmDialog isOpen={confirmDefault}
        onClose={() => { setConfirmDefault(false); addLog('ConfirmDialog default → cancelled'); }}
        onConfirm={() => { setConfirmDefault(false); addLog('ConfirmDialog default → confirmed'); }}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action will apply the selected changes to the current batch."
        confirmText="Confirm" cancelText="Cancel" variant="default" />

      <ConfirmDialog isOpen={confirmDanger}
        onClose={() => { setConfirmDanger(false); addLog('ConfirmDialog danger → cancelled'); }}
        onConfirm={() => { setConfirmDanger(false); addLog('ConfirmDialog danger → DELETED'); }}
        title="Delete Student"
        message="This will permanently remove Arun Kumar and all their attendance records. This action cannot be undone."
        confirmText="Delete" cancelText="Keep Student" variant="danger" />

      <ConfirmDialog isOpen={confirmWarning}
        onClose={() => { setConfirmWarning(false); addLog('ConfirmDialog warning → cancelled'); }}
        onConfirm={() => { setConfirmWarning(false); addLog('ConfirmDialog warning → confirmed'); }}
        title="Archive Batch"
        message="Archiving Batch B will mark it as completed. Students will still be visible in reports but no new attendance can be recorded."
        confirmText="Archive Batch" cancelText="Go Back" variant="warning" />

      {/* ════════════════════════════════════════════════════════════════
          Drawer instances — left
      ════════════════════════════════════════════════════════════════ */}

      <Drawer isOpen={drawerLeftSm} onClose={() => { setDrawerLeftSm(false); addLog('Drawer left sm → closed'); }}
        title="Navigation" position="left" size="sm">
        <DrawerContent />
      </Drawer>

      <Drawer isOpen={drawerLeftMd} onClose={() => { setDrawerLeftMd(false); addLog('Drawer left md → closed'); }}
        title="Filters" position="left" size="md">
        <DrawerContent />
      </Drawer>

      <Drawer isOpen={drawerLeftLg} onClose={() => { setDrawerLeftLg(false); addLog('Drawer left lg → closed'); }}
        title="Advanced Filters" position="left" size="lg">
        <DrawerContent />
      </Drawer>

      {/* ════════════════════════════════════════════════════════════════
          Drawer instances — right
      ════════════════════════════════════════════════════════════════ */}

      <Drawer isOpen={drawerRightSm} onClose={() => { setDrawerRightSm(false); addLog('Drawer right sm → closed'); }}
        title="Quick Details" position="right" size="sm">
        <p className="text-sm text-secondary-700">Compact right drawer (w-72). Quick-glance detail panels or short secondary navigation.</p>
      </Drawer>

      <Drawer isOpen={drawerRightMd} onClose={() => { setDrawerRightMd(false); addLog('Drawer right md → closed'); }}
        title="Student Detail" position="right" size="md">
        <SampleForm />
      </Drawer>

      <Drawer isOpen={drawerRightLg} onClose={() => { setDrawerRightLg(false); addLog('Drawer right lg → closed'); }}
        title="Batch Overview" position="right" size="lg">
        <div className="space-y-4">
          <SampleForm />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
            <textarea rows={4} placeholder="Batch notes…"
              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent" />
          </div>
        </div>
      </Drawer>

      {/* ════════════════════════════════════════════════════════════════
          LoadingOverlay instances — fullscreen
      ════════════════════════════════════════════════════════════════ */}

      <LoadingOverlay isOpen={loadingFullscreen}   message="Saving attendance…"  size="md" />
      <LoadingOverlay isOpen={loadingFullscreenLg} message="Generating report…"  size="lg" />

      {/* Container LoadingOverlay is rendered inline above inside its card */}
    </div>
  );
};

export default OverlayDemo;
