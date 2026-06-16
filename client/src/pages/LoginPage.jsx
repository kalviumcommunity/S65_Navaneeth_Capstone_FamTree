// client/src/pages/LoginPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function FeatureCard({ title, description, icon }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function DemoMemberCard({ className, name, meta, label, accent = 'male' }) {
  const palettes = {
    male: {
      card: 'border-cyan-200/80 bg-white shadow-[0_14px_36px_rgba(14,165,233,0.10)]',
      avatar: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      dot: 'bg-cyan-500',
      label: 'bg-cyan-50 text-cyan-700',
      name: 'text-slate-900',
    },
    female: {
      card: 'border-orange-200/80 bg-white shadow-[0_14px_36px_rgba(249,115,22,0.10)]',
      avatar: 'border-orange-200 bg-orange-50 text-orange-700',
      dot: 'bg-orange-500',
      label: 'bg-orange-50 text-orange-700',
      name: 'text-slate-900',
    },
  }

  const tone = palettes[accent]

  return (
    <div className={`absolute ${className} flex flex-col items-start`}>
      <div className={`relative flex h-[76px] w-[190px] items-center rounded-2xl border px-3 ${tone.card}`}>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[14px] font-semibold ${tone.avatar}`}>
          {name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')}
        </div>
        <div className="ml-3 min-w-0 flex-1 pr-4">
          <div className={`truncate text-[14px] font-semibold leading-tight ${tone.name}`}>{name}</div>
          <div className="mt-1 truncate text-[12px] text-slate-500">{meta}</div>
        </div>
        <span className={`absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${tone.dot}`} />
      </div>
      {label ? (
        <div className={`mt-2 rounded-full px-3 py-1 text-[12px] font-semibold ${tone.label}`}>{label}</div>
      ) : null}
    </div>
  )
}

function TreePreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_26px_80px_rgba(15,23,42,0.09)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">Our Family Tree</h2>
          <p className="mt-1 text-sm text-slate-500">A living view of family connections and generations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">6 Generations</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">32 Members</span>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Export
          </button>
        </div>
      </div>

      <div className="relative mt-5 min-h-[640px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_55%),linear-gradient(180deg,#fbfbf8_0%,#f5f7f3_100%)] p-4 sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:28px_28px] opacity-45" />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 620" aria-hidden="true">
          <g fill="none" stroke="#94a3b8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 340 92 H 660" strokeWidth="2.5" />
            <path d="M 500 92 V 136" strokeWidth="2.5" />
            <circle cx="500" cy="92" r="6" fill="#fff" stroke="#94a3b8" strokeWidth="2.5" />

            <path d="M 256 210 H 744" strokeWidth="2.5" />
            <path d="M 500 136 V 210" strokeWidth="2.5" />
            <circle cx="500" cy="210" r="6" fill="#fff" stroke="#94a3b8" strokeWidth="2.5" />

            <path d="M 150 324 H 850" strokeWidth="2.5" />
            <path d="M 240 210 V 324" strokeWidth="2.5" />
            <path d="M 410 210 V 324" strokeWidth="2.5" />
            <path d="M 590 210 V 324" strokeWidth="2.5" />
            <path d="M 780 210 V 324" strokeWidth="2.5" />

            <path d="M 220 446 H 470" strokeWidth="2.5" />
            <path d="M 330 324 V 446" strokeWidth="2.5" />
            <path d="M 330 446 V 500" strokeWidth="2.5" />
            <path d="M 330 500 H 330" strokeWidth="2.5" />

            <path d="M 520 446 H 760" strokeWidth="2.5" />
            <path d="M 500 324 V 446" strokeWidth="2.5" />
            <path d="M 700 324 V 446" strokeWidth="2.5" />
            <path d="M 860 324 V 446" strokeWidth="2.5" />
          </g>
        </svg>

        <DemoMemberCard className="left-[50%] top-[18px] -translate-x-1/2" name="Chandu" meta="Male · 1940 - 2005" label="" accent="male" />
        <DemoMemberCard className="left-[50%] top-[18px] translate-x-[140px]" name="Uthiyamma" meta="Female · 1945 - 2010" label="" accent="female" />

        <DemoMemberCard className="left-[50%] top-[158px] -translate-x-[260px]" name="Narayanan Nair" meta="Male · 1965" label="" accent="male" />
        <DemoMemberCard className="left-[50%] top-[158px] translate-x-[90px]" name="Baby Amma" meta="Female · 1968" label="" accent="female" />

        <DemoMemberCard className="left-[50%] top-[300px] -translate-x-[360px]" name="Sunil Kumar E" meta="Male · 1990" label="Son" accent="male" />
        <DemoMemberCard className="left-[50%] top-[300px] -translate-x-[150px]" name="Sajitha M" meta="Female · 1992" label="Wife" accent="female" />
        <DemoMemberCard className="left-[50%] top-[300px] translate-x-[40px]" name="Vijayan Karicheri" meta="Male · 1988" label="Son" accent="male" />
        <DemoMemberCard className="left-[50%] top-[300px] translate-x-[240px]" name="Muraleedharan E" meta="Male · 1988" label="Son" accent="male" />

        <DemoMemberCard className="left-[50%] top-[440px] -translate-x-[430px]" name="Navaneeth M" meta="Male · 2015" label="Child" accent="male" />
        <DemoMemberCard className="left-[50%] top-[440px] -translate-x-[245px]" name="Niveditha Sunil M" meta="Female · 2018" label="Child" accent="female" />
        <DemoMemberCard className="left-[50%] top-[440px] -translate-x-[20px]" name="Suhas KV" meta="Male · 2013" label="Child" accent="male" />
        <DemoMemberCard className="left-[50%] top-[440px] translate-x-[155px]" name="Sabin" meta="Male" label="Child" accent="male" />
        <DemoMemberCard className="left-[50%] top-[440px] translate-x-[335px]" name="Keerthara" meta="Female" label="Child" accent="female" />

        <DemoMemberCard className="left-[50%] top-[556px] -translate-x-[80px]" name="Sravan" meta="Male · 2020" label="Grandchild" accent="male" />

        <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <button type="button" className="border-b border-slate-200 px-3 py-2 text-base font-semibold text-slate-700">+</button>
          <button type="button" className="border-b border-slate-200 px-3 py-2 text-base font-semibold text-slate-700">−</button>
          <button type="button" className="px-3 py-2 text-xs font-semibold text-slate-600">100%</button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate('/tree')
    } catch (err) {
      const status = err?.response?.status
      const baseURL = err?.config?.baseURL || ''
      const url = err?.config?.url || ''
      const attemptedUrl = `${String(baseURL).replace(/\/$/, '')}${url}`

      if (status === 404) {
        setError(`API endpoint not found (404). Check VITE_API_URL / backend deploy. Tried: ${attemptedUrl || url || 'unknown URL'}`)
      } else {
        setError(err?.response?.data?.message || err?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[430px_minmax(0,1fr)] lg:items-start xl:gap-10">
        <section className="rounded-[28px] border border-white/70 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="max-w-sm">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Login</h1>
            <p className="mt-3 text-base text-slate-600">
              New here?{' '}
              <Link className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline" to="/register">
                Create an account
              </Link>
            </p>

            {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-emerald-600 px-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.28)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
          </div>
        </section>

        <div className="lg:pt-2">
          <TreePreview />
        </div>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-3 lg:mt-10">
        <FeatureCard
          icon="◌"
          title="Visualize with Ease"
          description="Explore your family tree on an infinite canvas. Easily pan, zoom, and navigate."
        />
        <FeatureCard
          icon="⟡"
          title="Manage Relationships"
          description="Add, edit, and connect family members. Track lineage and relationships."
        />
        <FeatureCard
          icon="✦"
          title="Share Your Legacy"
          description="Share your family tree with relatives and collaborate on preserving family history."
        />
      </section>
    </div>
  )
}
