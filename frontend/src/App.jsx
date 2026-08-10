import { useState } from "react";

function LeadForm({ website, lead, setLead, onSubmit, loading, submitted }) {
  if (submitted)
    return (
      <div className="mt-6 rounded-2xl bg-white p-8 text-center text-slate-900">
        <div className="text-3xl">✓</div>
        <h3 className="mt-3 text-xl font-semibold">Request received</h3>
        <p className="mt-2 text-sm text-slate-500">
          Aurify will contact you regarding your request.
        </p>
      </div>
    );

  const update = (field, value) => setLead({ ...lead, [field]: value });

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-6 max-w-md rounded-2xl bg-white p-6 text-left text-slate-900 shadow-lg"
    >
      <h3 className="text-xl font-semibold">Get in touch with Aurify</h3>
      <p className="mb-5 mt-1 text-sm text-slate-500">
        Share your details and we'll get back to you.
      </p>

      <label className="text-sm font-medium">Name</label>
      <input
        required
        type="text"
        value={lead.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="Your full name"
        className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

      <label className="text-sm font-medium">Email</label>
      <input
        required
        type="email"
        value={lead.email}
        onChange={(e) => update("email", e.target.value)}
        placeholder="you@example.com"
        className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

      <label className="text-sm font-medium">Phone</label>
      <input
        required
        type="tel"
        inputMode="numeric"
        value={lead.phone}
        onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="10-digit phone number"
        className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

      {!website && (
        <>
          <label className="text-sm font-medium">Business Type</label>
          <input
            required
            type="text"
            value={lead.businessType}
            onChange={(e) => update("businessType", e.target.value)}
            placeholder="e.g. Restaurant, E-commerce"
            className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
          />
        </>
      )}

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Submitting..."
          : website
          ? "Get These Issues Fixed"
          : "Get Website Consultation"}
      </button>
    </form>
  );
}

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [noWebsite, setNoWebsite] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    businessType: "",
  });

  const analyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("http://localhost:5000/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setData(await res.json());
    } catch {
      setData({ error: "Unable to analyze website." });
    }

    setLoading(false);
  };

  const submitLead = async (e) => {
    e.preventDefault();

    if (lead.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLeadLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          website: noWebsite ? "" : url,
        }),
      });

      if (!res.ok) throw new Error();

      setSubmitted(true);
      setLead({ name: "", email: "", phone: "", businessType: "" });
    } catch {
      alert("Unable to submit request. Please try again.");
    }

    setLeadLoading(false);
  };

  const reset = () => {
    setData(null);
    setShowForm(false);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#172033]">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <h2 className="text-2xl font-bold">
          Aurify<span className="text-blue-600">.</span>
        </h2>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-14">
        {!data && (
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              FREE WEBSITE CHECK
            </p>

            <h1 className="mt-4 text-5xl font-bold">
              Know what your website needs.
            </h1>

            <p className="mt-5 text-lg text-slate-500">
              Check your website's SEO, Server Response and Mobile Readiness health.
            </p>

            <form
              onSubmit={analyze}
              className="mx-auto mt-9 flex max-w-2xl rounded-2xl bg-white p-2 shadow-lg"
            >
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="min-w-0 flex-1 px-4 outline-none"
              />

              <button className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white">
                {loading ? "Checking..." : "Check Website"}
              </button>
            </form>

            <button
              onClick={() => {
                setNoWebsite(true);
                setSubmitted(false);
              }}
              className="mt-6 text-sm text-blue-600"
            >
              I don't have a website →
            </button>

            {noWebsite && (
              <LeadForm
                website={false}
                lead={lead}
                setLead={setLead}
                onSubmit={submitLead}
                loading={leadLoading}
                submitted={submitted}
              />
            )}
          </section>
        )}

        {data && !data.error && (
          <section>
            <button onClick={reset} className="mb-8 text-sm text-blue-600">
              ← Check another website
            </button>

            <h1 className="break-all text-3xl font-bold">{url}</h1>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-sm text-slate-500">SEO Health</p>
                <p className="mt-3 text-5xl font-bold">
                  {data.scores.seo}
                  <span className="text-lg text-slate-400">/100</span>
                </p>
              </div>

              <div className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-sm text-slate-500">Server Response</p>
                <p className="mt-3 text-5xl font-bold">
                  {data.loadTime}
                  <span className="text-lg text-slate-400"> ms</span>
                </p>
              </div>

              <div className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-sm text-slate-500">Mobile Readiness</p>
                <p className="mt-3 text-5xl font-bold">
                  {data.scores.mobile}
                  <span className="text-lg text-slate-400">/100</span>
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-amber-600">
                🔴 Technical Issue Detected
              </p>

              <p className="mt-2 text-lg font-semibold">{data.issue}</p>

              <p className="mt-2 text-sm text-slate-500">
                Detailed technical recommendation available with Aurify.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-[#172033] p-7 text-white">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Want these issues fixed?</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    🔒 {data.additionalIssues} additional issues found
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowForm(true);
                    setSubmitted(false);
                  }}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
                >
                  Get These Issues Fixed by Aurify
                </button>
              </div>

              {showForm && (
                <LeadForm
                  website
                  lead={lead}
                  setLead={setLead}
                  onSubmit={submitLead}
                  loading={leadLoading}
                  submitted={submitted}
                />
              )}
            </div>
          </section>
        )}

        {data?.error && (
          <div className="mt-8 text-center text-red-500">
            {data.error}
          </div>
        )}
      </main>
    </div>
  );
}