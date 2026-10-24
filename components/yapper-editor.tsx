'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  HelpCircle,
  Link2,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type EmbedField = { name: string; value: string; inline: boolean }
type Embed = { title: string; description: string; color: string; url: string; fields: EmbedField[]; footer: string; timestamp: boolean }
type Message = { content: string; username: string; avatar: string; embeds: Embed[] }

const blankEmbed = (): Embed => ({ title: '', description: '', color: '#7C5CFC', url: '', fields: [], footer: '', timestamp: false })
const starter: Message[] = [{ content: 'Welcome to Yapper!', username: 'Yapper', avatar: '', embeds: [{ ...blankEmbed(), title: 'Build messages that stand out.', description: 'Use the editor to create rich webhook messages without writing JSON by hand.', color: '#7C5CFC', fields: [{ name: 'Getting started', value: 'Add content, customize an embed, then preview it on the right.', inline: false }], footer: 'Powered by Yapper', timestamp: true }] }]

const templates: Record<string, Message[]> = {
  'Server rules': [{ content: '', username: 'Community Team', avatar: '', embeds: [{ ...blankEmbed(), title: 'Server Rules', description: 'Please read and follow these rules to help keep our community welcoming.', color: '#F0B45B', fields: [{ name: '1. Be respectful', value: 'Treat everyone with kindness. Harassment is not welcome.', inline: false }, { name: '2. Stay on topic', value: 'Use each channel for its intended purpose.', inline: false }, { name: '3. No spam', value: 'Avoid excessive mentions, links, or repeated messages.', inline: false }], footer: 'Thanks for helping us keep Yapper friendly.', timestamp: true }] }],
  'Welcome message': [{ content: 'A new member just joined — say hello!', username: 'Welcome Bot', avatar: '', embeds: [{ ...blankEmbed(), title: 'Welcome to the server!', description: 'We are glad you are here. Take a look around and introduce yourself.', color: '#54D5A5', footer: 'Enjoy your stay!' }] }],
  Announcements: [{ content: '', username: 'Announcements', avatar: '', embeds: [{ ...blankEmbed(), title: 'Important announcement', description: 'Share your latest news here. Keep the most important details near the top.', color: '#7C5CFC', fields: [{ name: 'What is changing?', value: 'Describe the update in a few clear sentences.', inline: false }, { name: 'When?', value: 'Add a date or time here.', inline: true }, { name: 'Questions?', value: 'Point people to a channel or contact.', inline: true }] }] }],
  'Partnership requirements': [{ content: '', username: 'Partnerships', avatar: '', embeds: [{ ...blankEmbed(), title: 'Partnership requirements', description: 'Interested in partnering with us? Please check the requirements below.', color: '#F079B1', fields: [{ name: 'Community size', value: '100+ active members', inline: true }, { name: 'Activity', value: 'Consistent weekly activity', inline: true }, { name: 'Contact', value: 'Open a ticket to apply', inline: false }] }] }],
}

function IconButton({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="icon-button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return <label className="field-label">{children}{hint && <span className="hint" title={hint}><CircleHelp /></span>}</label>
}

export default function YapperEditor() {
  const [messages, setMessages] = useState<Message[]>(starter)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<'visual' | 'json'>('visual')
  const [json, setJson] = useState(JSON.stringify(starter, null, 2))
  const [jsonError, setJsonError] = useState('')
  const [section, setSection] = useState<'Editor' | 'Templates' | 'Guide' | 'Settings'>('Editor')
  const [saved, setSaved] = useState(false)
  const [secret, setSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => { const raw = localStorage.getItem('yapper-draft'); if (raw) { try { setMessages(JSON.parse(raw)) } catch {} } }, [])
  useEffect(() => { setJson(JSON.stringify(messages, null, 2)); localStorage.setItem('yapper-draft', JSON.stringify(messages)) }, [messages])
  const message = messages[active] ?? messages[0]
  const updateMessage = (patch: Partial<Message>) => setMessages((items) => items.map((item, index) => index === active ? { ...item, ...patch } : item))
  const updateEmbed = (index: number, patch: Partial<Embed>) => updateMessage({ embeds: message.embeds.map((item, i) => i === index ? { ...item, ...patch } : item) })
  const addEmbed = () => updateMessage({ embeds: [...message.embeds, blankEmbed()] })
  const loadTemplate = (name: string) => { setMessages(templates[name] ?? starter); setActive(0); setSection('Editor') }
  const exportJson = () => { const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'yapper-message.json'; a.click(); URL.revokeObjectURL(url) }
  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const next = JSON.parse(String(reader.result)); if (!Array.isArray(next)) throw new Error('Expected an array of messages'); setMessages(next); setJsonError('') } catch (error) { setJsonError(error instanceof Error ? error.message : 'Could not read this file.') } }; reader.readAsText(file) }
  const copyJson = async () => { await navigator.clipboard?.writeText(JSON.stringify(messages, null, 2)); setSaved(true); setTimeout(() => setSaved(false), 1600) }
  const parseJson = () => { try { const next = JSON.parse(json); if (!Array.isArray(next)) throw new Error('Messages must be an array.'); setMessages(next); setJsonError(''); setMode('visual') } catch (error) { setJsonError(error instanceof Error ? error.message : 'Invalid JSON') } }
  const clearDraft = () => { setMessages(starter); setActive(0); localStorage.removeItem('yapper-draft') }
  const totalChars = useMemo(() => message.content.length, [message.content])

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles /></div><div><strong>yapper</strong><span>webhook editor</span></div></div>
      <nav className="main-nav" aria-label="Main navigation">{(['Editor', 'Templates', 'Guide', 'Settings'] as const).map((item) => <button key={item} className={section === item ? 'nav-item active' : 'nav-item'} onClick={() => setSection(item)}>{item}</button>)}</nav>
      <div className="top-actions"><span className="saved-state"><span className="status-dot" /> Autosaved</span><IconButton label="More options"><MoreHorizontal /></IconButton><button className="mobile-menu"><Menu /></button></div>
    </header>

    {section === 'Editor' && <main className="workspace">
      <aside className="left-panel">
        <div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h1>Message builder</h1></div><IconButton label="Workspace options"><MoreHorizontal /></IconButton></div>
        <div className="message-list">{messages.map((item, index) => <button key={index} className={index === active ? 'message-tab active' : 'message-tab'} onClick={() => setActive(index)}><span className="message-number">{String(index + 1).padStart(2, '0')}</span><span className="message-tab-text"><strong>{item.embeds[0]?.title || item.content || 'Untitled message'}</strong><small>{item.embeds.length} embed{item.embeds.length === 1 ? '' : 's'}</small></span><ChevronRight /></button>)}</div>
        <button className="add-message" onClick={() => { setMessages([...messages, { content: '', username: '', avatar: '', embeds: [] }]); setActive(messages.length) }}><Plus /> Add message</button>
        <div className="panel-tip"><Sparkles /><div><strong>Start from a template</strong><p>Skip the blank page with a ready-made message.</p><button onClick={() => setSection('Templates')}>Browse templates <ExternalLink /></button></div></div>
      </aside>

      <section className="editor-panel">
        <div className="editor-toolbar"><div><span className="eyebrow">MESSAGE {String(active + 1).padStart(2, '0')}</span><h2>{message.embeds[0]?.title || 'Untitled message'}</h2></div><div className="toolbar-actions"><button className="subtle-button" onClick={() => setMessages(messages.map((m, i) => i === active ? structuredClone(m) : m))}><Copy /> Duplicate</button><button className="subtle-button danger" onClick={() => { if (messages.length > 1) { setMessages(messages.filter((_, i) => i !== active)); setActive(Math.max(0, active - 1)) } }}><Trash2 /> Delete</button></div></div>
        <div className="mode-switch"><button className={mode === 'visual' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('visual')}><Sparkles /> Visual editor</button><button className={mode === 'json' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('json')}><Code2 /> JSON editor</button></div>
        {mode === 'json' ? <div className="json-editor-wrap"><textarea className="json-editor" value={json} onChange={(e) => { setJson(e.target.value); setJsonError('') }} spellCheck={false} aria-label="Message JSON" /><div className="json-actions"><button className="subtle-button" onClick={() => setJson(JSON.stringify(messages, null, 2))}>Format JSON</button><button className="subtle-button" onClick={copyJson}><Copy /> {saved ? 'Copied' : 'Copy JSON'}</button><label className="subtle-button file-label"><Upload /> Import JSON<input type="file" accept="application/json" onChange={importJson} /></label><button className="primary-button" onClick={parseJson}><Check /> Apply changes</button></div>{jsonError && <div className="error-message"><AlertCircle /> {jsonError}</div>}</div> : <div className="form-content">
          <div className="section-card"><div className="card-heading"><div><h3>Message content</h3><p>Say something alongside your embed.</p></div><span className="char-count">{totalChars} / 2,000</span></div><textarea className="text-input content-input" value={message.content} onChange={(e) => updateMessage({ content: e.target.value })} placeholder="Write a message..." maxLength={2000} /></div>
          <div className="section-card"><div className="card-heading"><div><h3>Appearance</h3><p>Customize how the webhook appears.</p></div><span className="optional">OPTIONAL</span></div><div className="form-grid"><div><FieldLabel hint="The name shown above your message.">Username</FieldLabel><input className="text-input" value={message.username} onChange={(e) => updateMessage({ username: e.target.value })} placeholder="Yapper" /></div><div><FieldLabel hint="A direct image URL for the avatar.">Avatar URL</FieldLabel><input className="text-input" value={message.avatar} onChange={(e) => updateMessage({ avatar: e.target.value })} placeholder="https://..." /></div></div></div>
          <div className="section-card embeds-card"><div className="card-heading"><div><h3>Embeds <span className="count-badge">{message.embeds.length}</span></h3><p>Rich cards with color, links, and structured fields.</p></div><button className="subtle-button" onClick={addEmbed}><Plus /> Add embed</button></div>{message.embeds.length === 0 && <div className="empty-embed"><FileJson /><strong>No embeds yet</strong><span>Add an embed to make your message more visual.</span><button className="primary-button" onClick={addEmbed}><Plus /> Add first embed</button></div>}{message.embeds.map((embed, index) => <div className="embed-form" key={index}><div className="embed-form-heading"><div className="embed-index"><span style={{ background: embed.color }} /> Embed {index + 1}</div><div className="inline-actions"><IconButton label="Duplicate embed" onClick={() => updateMessage({ embeds: [...message.embeds, structuredClone(embed)] })}><Copy /></IconButton><IconButton label="Delete embed" onClick={() => updateMessage({ embeds: message.embeds.filter((_, i) => i !== index) })}><Trash2 /></IconButton></div></div><div className="form-grid"><div><FieldLabel>Title</FieldLabel><input className="text-input" value={embed.title} onChange={(e) => updateEmbed(index, { title: e.target.value })} placeholder="Your embed title" maxLength={256} /></div><div><FieldLabel>Title URL <span className="optional">OPTIONAL</span></FieldLabel><input className="text-input" value={embed.url} onChange={(e) => updateEmbed(index, { url: e.target.value })} placeholder="https://example.com" /></div></div><div><FieldLabel>Description <span className="optional">OPTIONAL</span></FieldLabel><textarea className="text-input" value={embed.description} onChange={(e) => updateEmbed(index, { description: e.target.value })} placeholder="Add supporting text. Markdown is supported." maxLength={4096} /><div className="input-foot"><span>Markdown supported</span><span>{embed.description.length} / 4,096</span></div></div><div className="color-row"><div><FieldLabel>Accent color</FieldLabel><div className="color-input"><input type="color" value={embed.color} onChange={(e) => updateEmbed(index, { color: e.target.value })} /><input value={embed.color} onChange={(e) => updateEmbed(index, { color: e.target.value })} aria-label="Embed color hex" /></div></div><label className="checkbox-label"><input type="checkbox" checked={embed.timestamp} onChange={(e) => updateEmbed(index, { timestamp: e.target.checked })} /> Show timestamp <span className="hint" title="Uses the current time when previewing."><CircleHelp /></span></label></div><div className="fields-list"><div className="subheading"><span>Fields <span className="optional">OPTIONAL</span></span><button className="link-button" onClick={() => updateEmbed(index, { fields: [...embed.fields, { name: '', value: '', inline: false }] })}><Plus /> Add field</button></div>{embed.fields.map((field, fieldIndex) => <div className="field-row" key={fieldIndex}><input className="text-input" value={field.name} onChange={(e) => updateEmbed(index, { fields: embed.fields.map((f, i) => i === fieldIndex ? { ...f, name: e.target.value } : f) })} placeholder="Field name" /><input className="text-input" value={field.value} onChange={(e) => updateEmbed(index, { fields: embed.fields.map((f, i) => i === fieldIndex ? { ...f, value: e.target.value } : f) })} placeholder="Field value" /><label className="inline-check"><input type="checkbox" checked={field.inline} onChange={(e) => updateEmbed(index, { fields: embed.fields.map((f, i) => i === fieldIndex ? { ...f, inline: e.target.checked } : f) })} /> Inline</label><IconButton label="Remove field" onClick={() => updateEmbed(index, { fields: embed.fields.filter((_, i) => i !== fieldIndex) })}><X /></IconButton></div>)}</div><div className="form-grid"><div><FieldLabel>Footer <span className="optional">OPTIONAL</span></FieldLabel><input className="text-input" value={embed.footer} onChange={(e) => updateEmbed(index, { footer: e.target.value })} placeholder="Small text at the bottom" maxLength={2048} /></div><div><FieldLabel>Image URL <span className="optional">OPTIONAL</span></FieldLabel><input className="text-input" placeholder="https://..." /><span className="help-text">URL must point directly to an image.</span></div></div></div>)}</div>
        </div>}
      </section>

      <aside className="preview-panel"><div className="preview-heading"><div><span className="eyebrow">LIVE PREVIEW</span><h2>How it will look</h2></div><button className="preview-device"><Eye /> Preview</button></div><div className="discord-preview"><div className="discord-server"><div className="server-icon">Y</div><div><strong>yapper community</strong><span># announcements</span></div></div><div className="discord-message"><div className="avatar">{message.username?.charAt(0) || 'Y'}</div><div className="discord-content"><div className="author"><strong>{message.username || 'Yapper'}</strong><span>BOT</span><small>Today at 10:42 AM</small></div>{message.content && <p className="preview-content">{message.content}</p>}{message.embeds.map((embed, index) => <div className="discord-embed" key={index} style={{ borderLeftColor: embed.color }}><div className="embed-preview-body">{embed.title && <a className="preview-title" href={embed.url || '#'} onClick={(e) => { if (!embed.url) e.preventDefault() }}>{embed.title}</a>}{embed.description && <p className="preview-description">{embed.description}</p>}{embed.fields.length > 0 && <div className="preview-fields">{embed.fields.map((field, i) => <div className={field.inline ? 'preview-field inline' : 'preview-field'} key={i}><strong>{field.name || 'Field name'}</strong><span>{field.value || 'Field value'}</span></div>)}</div>}{embed.footer && <div className="preview-footer">{embed.footer}{embed.timestamp && <span> • just now</span>}</div>}</div></div>)}{!message.content && message.embeds.length === 0 && <div className="preview-empty">Your message preview will appear here.</div>}</div></div></div><div className="preview-note"><Eye /> Preview only — sending is disabled until a verified Yapper endpoint is configured.</div></aside>
    </main>}

    {section === 'Templates' && <section className="page-section"><span className="eyebrow">START FASTER</span><h1>Templates</h1><p className="page-lede">Choose a starting point, then make it yours.</p><div className="template-grid">{Object.keys(templates).map((name) => <button className="template-card" key={name} onClick={() => loadTemplate(name)}><div className="template-icon"><FileJson /></div><strong>{name}</strong><span>Load into editor <ChevronRight /></span></button>)}{['Staff applications', 'Updates and changelogs', 'Giveaway announcements', 'Support information'].map((name) => <button className="template-card" key={name} onClick={() => loadTemplate('Announcements')}><div className="template-icon muted"><FileJson /></div><strong>{name}</strong><span>Load into editor <ChevronRight /></span></button>)}</div></section>}
    {section === 'Guide' && <section className="page-section"><span className="eyebrow">NEW TO WEBHOOKS?</span><h1>Quick guide</h1><p className="page-lede">Everything you need to create your first message.</p><div className="guide-list">{[['01', 'What is a webhook?', 'A webhook is a secure URL that lets another app post a message into your Yapper community.'], ['02', 'Configure your integration', 'Add your Yapper webhook secret in Settings. It stays in this browser and is never included in exported JSON.'], ['03', 'Create a message', 'Use the visual editor to add content, choose a username, and build one or more embeds.'], ['04', 'Preview and validate', 'The live preview shows supported fields as they will appear. Character counters help prevent invalid payloads.'], ['05', 'Export and restore', 'Use JSON editor to copy or download your message. Import it later to keep editing.'], ['06', 'Keep secrets safe', 'Never paste a webhook secret into public messages, screenshots, shared links, or exported files.']].map(([n, title, text]) => <div className="guide-row" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div><ChevronRight /></div>)}</div></section>}
    {section === 'Settings' && <section className="page-section settings-page"><span className="eyebrow">CONFIGURATION</span><h1>Settings</h1><p className="page-lede">Connect Yapper when you are ready to send.</p><div className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Settings /></div><div><h3>Yapper integration</h3><p>Sending is safely disabled until the official outbound API is verified.</p></div><span className="coming-badge">NOT CONNECTED</span></div><div className="notice"><AlertCircle /><div><strong>Sending is currently unavailable</strong><p>We do not yet have a verified Yapper endpoint, authentication scheme, or payload contract. Your editor and preview are fully usable while this is being confirmed.</p></div></div><FieldLabel hint="Stored only in this browser. Never included in message exports.">Webhook secret</FieldLabel><div className="secret-input"><input type={showSecret ? 'text' : 'password'} value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Paste your secret when supported" disabled /><button disabled onClick={() => setShowSecret(!showSecret)}>{showSecret ? 'Hide' : 'Show'}</button></div><div className="settings-actions"><button className="subtle-button" onClick={clearDraft}><RotateCcw /> Clear saved draft</button><button className="subtle-button" onClick={exportJson}><Download /> Export current JSON</button></div></div></section>}

    <footer className="footer"><span>Yapper webhook editor</span><span>Local-first drafts · No account required</span><button onClick={() => setSection('Guide')}>Read the guide <ChevronRight /></button></footer>
  </div>
}
