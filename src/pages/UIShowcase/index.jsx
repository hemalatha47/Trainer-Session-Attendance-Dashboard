/**
 * UIShowcase/index.jsx
 * Component library visual reference (Module 3.2, Task 18).
 *
 * Development-only page — not linked in production navigation.
 * Access via: /ui-showcase (add route in development only).
 *
 * Shows every component variant, state, and size so developers and
 * reviewers can visually validate the entire component library at once.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@constants/animations';
import {
  Button, Input, Textarea, Select, Checkbox,
  Radio, RadioGroup, Switch, Badge, Avatar, AvatarGroup,
  Divider, Icon,
} from '@components/ui';
import {
  Plus, Pencil, Download, Trash2, Check, ChevronRight,
  User, Mail, Lock, Search
} from 'lucide-react';

// ── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-lg font-semibold text-primary-600 border-b border-border pb-2">
      {title}
    </h2>
    {children}
  </section>
);

// ── Row of examples ──────────────────────────────────────────────────────────
const Row = ({ label, children, wrap = false }) => (
  <div className="flex flex-col gap-1.5">
    {label && <p className="text-xs font-medium text-textMuted uppercase tracking-wide">{label}</p>}
    <div className={`flex items-center gap-3 ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  </div>
);

// ── Main showcase ────────────────────────────────────────────────────────────
const UIShowcase = () => {
  const [inputVal, setInputVal] = useState('');
  const [textareaVal, setTextareaVal] = useState('');
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(true);
  const [radio, setRadio] = useState('option1');
  const [toggle, setToggle] = useState(false);
  const [selectVal, setSelectVal] = useState('');

  const selectOptions = [
    { value: 'batch_a', label: 'Batch A – Jan 2026' },
    { value: 'batch_b', label: 'Batch B – Apr 2026' },
    { value: 'batch_c', label: 'Batch C – Jul 2026', disabled: true },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background p-6 lg:p-10"
      {...pageTransition}
    >
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary-600">
            UI Component Library
          </h1>
          <p className="mt-1 text-sm text-textMuted">
            Module 3.2 — Core UI Components showcase. Development reference only.
          </p>
        </div>

        {/* ── Buttons ─────────────────────────────────────────────────────── */}
        <Section title="Button">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </Row>

          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>

          <Row label="With Icons">
            <Button variant="primary" iconLeft={<Plus className="w-4 h-4" />}>
              Add Batch
            </Button>
            <Button variant="outline" iconLeft={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button variant="secondary" iconRight={<ChevronRight className="w-4 h-4" />}>
              Continue
            </Button>
            <Button variant="ghost" iconLeft={<Pencil className="w-4 h-4" />} size="sm">
              Edit
            </Button>
            <Button variant="danger" iconLeft={<Trash2 className="w-4 h-4" />} size="sm">
              Delete
            </Button>
          </Row>

          <Row label="States">
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" loading size="sm">Loading</Button>
          </Row>

          <Row label="Full Width">
            <div className="w-full max-w-xs">
              <Button variant="primary" fullWidth>Submit Attendance</Button>
            </div>
          </Row>
        </Section>

        <Divider />

        {/* ── Input ───────────────────────────────────────────────────────── */}
        <Section title="Input">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Email address"
              type="email"
              placeholder="manager@example.com"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              leadingIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
            />
            <Input
              type="search"
              placeholder="Search students…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Input
              label="Student ID"
              placeholder="NM2026001"
              helperText="Unique roll number assigned at enrolment."
            />
            <Input
              label="Error state"
              value="invalid-email"
              errorMessage="Enter a valid email address."
              type="email"
            />
            <Input
              label="Success state"
              value="manager@aaro.com"
              successMessage="Email looks good!"
              type="email"
            />
            <Input
              label="Disabled"
              value="readonly value"
              disabled
            />
          </div>
        </Section>

        <Divider />

        {/* ── Textarea ────────────────────────────────────────────────────── */}
        <Section title="Textarea">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Textarea
              label="Batch description"
              placeholder="Describe the batch objectives…"
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
              maxLength={200}
              helperText="Keep it brief and informative."
            />
            <Textarea
              label="Error state"
              value="too short"
              errorMessage="Description must be at least 20 characters."
              rows={4}
            />
          </div>
        </Section>

        <Divider />

        {/* ── Select ──────────────────────────────────────────────────────── */}
        <Section title="Select">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Select
              label="Select Batch"
              placeholder="Choose a batch…"
              options={selectOptions}
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              helperText="Only active batches are shown."
            />
            <Select
              label="Error state"
              placeholder="Choose a batch…"
              options={selectOptions}
              errorMessage="Please select a batch to continue."
            />
            <Select
              label="Loading state"
              placeholder="Loading batches…"
              options={[]}
              loading
            />
            <Select
              label="Disabled"
              options={selectOptions}
              value="batch_a"
              disabled
            />
          </div>
        </Section>

        <Divider />

        {/* ── Checkbox ────────────────────────────────────────────────────── */}
        <Section title="Checkbox">
          <Row label="States" wrap>
            <Checkbox
              label="Mark as present"
              checked={checkA}
              onChange={(e) => setCheckA(e.target.checked)}
            />
            <Checkbox
              label="Checked"
              checked={checkB}
              onChange={(e) => setCheckB(e.target.checked)}
            />
            <Checkbox
              label="With description"
              description="This student joined after the first session."
              checked={checkA}
              onChange={(e) => setCheckA(e.target.checked)}
            />
            <Checkbox
              label="Indeterminate (select-all)"
              indeterminate
            />
            <Checkbox
              label="Disabled unchecked"
              disabled
            />
            <Checkbox
              label="Disabled checked"
              checked
              disabled
            />
          </Row>
          <Row label="Validation">
            <Checkbox
              label="Accept terms"
              errorMessage="You must accept the terms to continue."
            />
          </Row>
        </Section>

        <Divider />

        {/* ── Radio ───────────────────────────────────────────────────────── */}
        <Section title="Radio">
          <RadioGroup
            name="attendance-filter"
            legend="Filter by status"
            orientation="horizontal"
          >
            <Radio
              value="option1"
              label="All Students"
              checked={radio === 'option1'}
              onChange={() => setRadio('option1')}
            />
            <Radio
              value="option2"
              label="Present Only"
              checked={radio === 'option2'}
              onChange={() => setRadio('option2')}
            />
            <Radio
              value="option3"
              label="Absent Only"
              checked={radio === 'option3'}
              onChange={() => setRadio('option3')}
            />
            <Radio
              value="option4"
              label="Disabled option"
              checked={radio === 'option4'}
              onChange={() => setRadio('option4')}
              disabled
            />
          </RadioGroup>
        </Section>

        <Divider />

        {/* ── Switch ──────────────────────────────────────────────────────── */}
        <Section title="Switch">
          <Row label="States" wrap>
            <Switch
              checked={toggle}
              onChange={(e) => setToggle(e.target.checked)}
              label="Enable notifications"
              description="Receive alerts when attendance drops below threshold."
            />
            <Switch
              checked
              label="Active (no handler)"
              size="sm"
            />
            <Switch
              disabled
              label="Disabled off"
            />
            <Switch
              checked
              disabled
              label="Disabled on"
            />
          </Row>
          <Row label="Sizes">
            <Switch size="sm" checked label="Small" />
            <Switch size="md" checked label="Medium" />
            <Switch size="lg" checked label="Large" />
          </Row>
        </Section>

        <Divider />

        {/* ── Badge ───────────────────────────────────────────────────────── */}
        <Section title="Badge">
          <Row label="Generic variants" wrap>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </Row>

          <Row label="Attendance-specific" wrap>
            <Badge variant="present" dot>Present</Badge>
            <Badge variant="absent" dot>Absent</Badge>
            <Badge variant="late" dot>Late</Badge>
            <Badge variant="leave" dot>On Leave</Badge>
          </Row>

          <Row label="Batch status" wrap>
            <Badge variant="active" dot>Active</Badge>
            <Badge variant="completed" dot>Completed</Badge>
            <Badge variant="upcoming" dot>Upcoming</Badge>
          </Row>

          <Row label="Sizes" wrap>
            <Badge variant="present" size="sm" dot>Present (sm)</Badge>
            <Badge variant="present" size="md" dot>Present (md)</Badge>
            <Badge variant="present" size="lg" dot>Present (lg)</Badge>
          </Row>

          <Row label="With icon" wrap>
            <Badge variant="success" icon={<Check className="w-3 h-3" />}>
              Marked
            </Badge>
          </Row>
        </Section>

        <Divider />

        {/* ── Avatar ──────────────────────────────────────────────────────── */}
        <Section title="Avatar">
          <Row label="Sizes">
            <Avatar name="Arun Kumar" size="xs" />
            <Avatar name="Divya Priya" size="sm" />
            <Avatar name="Manoj Raj" size="md" />
            <Avatar name="Training Manager" size="lg" />
            <Avatar name="Admin User" size="xl" />
          </Row>

          <Row label="With status">
            <Avatar name="Arun Kumar" size="md" status="online" />
            <Avatar name="Divya Priya" size="md" status="away" />
            <Avatar name="Manoj Raj" size="md" status="busy" />
            <Avatar name="Offline User" size="md" status="offline" />
          </Row>

          <Row label="Group">
            <AvatarGroup max={3} size="sm">
              <Avatar name="Arun Kumar" />
              <Avatar name="Divya Priya" />
              <Avatar name="Manoj Raj" />
              <Avatar name="Preethi S" />
              <Avatar name="Karthik V" />
            </AvatarGroup>
          </Row>
        </Section>

        <Divider />

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <Section title="Divider">
          <Row label="Horizontal (default)">
            <div className="w-full max-w-md">
              <p className="text-sm text-textMuted mb-2">Content above</p>
              <Divider spacing="sm" />
              <p className="text-sm text-textMuted mt-2">Content below</p>
            </div>
          </Row>
          <Row label="Text divider">
            <div className="w-full max-w-md">
              <Divider label="OR" spacing="sm" />
            </div>
          </Row>
          <Row label="Vertical">
            <div className="flex items-center h-8 gap-0">
              <span className="text-sm text-textMuted">Left</span>
              <Divider orientation="vertical" spacing="md" />
              <span className="text-sm text-textMuted">Right</span>
            </div>
          </Row>
        </Section>

        <Divider />

        {/* ── Icon ────────────────────────────────────────────────────────── */}
        <Section title="Icon">
          <Row label="Sizes" wrap>
            <Icon name="dashboard" size="xs" className="text-accent-600" />
            <Icon name="dashboard" size="sm" className="text-accent-600" />
            <Icon name="dashboard" size="md" className="text-accent-600" />
            <Icon name="dashboard" size="lg" className="text-accent-600" />
            <Icon name="dashboard" size="xl" className="text-accent-600" />
          </Row>
          <Row label="Semantic names" wrap>
            <Icon name="dashboard" className="text-primary-600" />
            <Icon name="batches" className="text-primary-600" />
            <Icon name="students" className="text-primary-600" />
            <Icon name="attendance" className="text-primary-600" />
            <Icon name="reports" className="text-primary-600" />
            <Icon name="analytics" className="text-primary-600" />
            <Icon name="settings" className="text-secondary-500" />
            <Icon name="add" className="text-success-DEFAULT" />
            <Icon name="edit" className="text-accent-600" />
            <Icon name="delete" className="text-danger-DEFAULT" />
            <Icon name="present" className="text-success-DEFAULT" />
            <Icon name="absent" className="text-danger-DEFAULT" />
            <Icon name="spinner" className="text-accent-600 animate-spin" />
          </Row>
        </Section>

        <Divider spacing="xl" />

        {/* Footer */}
        <p className="text-center text-xs text-textMuted pb-6">
          Module 3.2 — Core UI Component Library — Naan Mudhalvan Internship 2026
        </p>

      </div>
    </motion.div>
  );
};

export default UIShowcase;
