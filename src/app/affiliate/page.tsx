"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  Building,
  Globe,
  ArrowRight,
  ShieldAlert,
  Send,
  FileCheck,
} from "lucide-react";
import Header from "@/components/landing/Header";
import CinematicFooter from "@/components/landing/cinematic/CinematicFooter";
import { Validators } from "@/lib/validation/form-validator";

export default function AffiliatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orgOrChannel: "",
    partnerType: "Campus Ambassador",
    communitySize: "1,000 - 5,000",
    website: "",
    proposal: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const reqName = Validators.required("Full Name")(formData.name, formData);
    if (reqName) newErrors.name = reqName;

    const emailErr = Validators.email()(formData.email, formData);
    if (emailErr) newErrors.email = emailErr;

    const reqOrg = Validators.required("Community or Organization name")(formData.orgOrChannel, formData);
    if (reqOrg) newErrors.orgOrChannel = reqOrg;

    const reqProp = Validators.minLength(20, "Partnership proposal")(formData.proposal, formData);
    if (reqProp) newErrors.proposal = reqProp;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#070b14] text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Sparkles size={14} />
            <span>SkillBridge Educational Partnership & Ambassador Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Partner with SkillBridge to Bridge Campus & Industry
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Collaborate with our ecosystem to bring accredited capstones, curriculum roadmaps, and direct hiring pipelines to your student community, tech club, or educational network.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-sb-cyan">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold">Curriculum & Certification Grants</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Equip your community members with sponsored access to verified skill assessment badges and industry capstone project workspaces.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-500/10 text-pink-600 dark:text-sb-pink">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold">Campus Ambassador Sponsorships</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Receive official hackathon co-sponsorships, mentorship speaker sessions, and promotional workshop toolkits for your college club.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building size={24} />
            </div>
            <h3 className="text-lg font-bold">Direct Employer Placement Access</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast-track your top-performing cohort members directly into exclusive enterprise recruitment drives and capstone showcases.
            </p>
          </div>
        </div>

        {/* How It Works & Eligibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">How the Partnership Works</h2>

            <ol className="space-y-4">
              <li className="flex gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <span className="flex-none grid h-8 w-8 place-items-center rounded-full bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-black font-bold text-xs">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold">Submit Partnership Application</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide details about your student club, educational channel, or institutional group and outline your collaboration goals.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <span className="flex-none grid h-8 w-8 place-items-center rounded-full bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-black font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold">Review & Partnership Agreement</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Our University and Community Relations team reviews applications within 3–5 business days to verify community authenticity.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <span className="flex-none grid h-8 w-8 place-items-center rounded-full bg-[#007BA7] text-white dark:bg-sb-cyan dark:text-black font-bold text-xs">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold">Partner Toolkit & Community Cohorts</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Receive your verified partner portal access, unique cohort tracking link, and student workshop resources.
                  </p>
                </div>
              </li>
            </ol>

            {/* Scope Notice */}
            <div className="flex gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-1">Partnership & Financial Model Transparency</strong>
                SkillBridge operates as an accredited educational operating system. Affiliate partnerships focus on curriculum grants, institutional collaborations, and community sponsorships rather than transactional commercial click-commissions.
              </div>
            </div>
          </div>

          {/* Interactive Application Form */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-in fade-in-0 duration-300">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <FileCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Your partner application for <strong>{formData.orgOrChannel}</strong> has been logged. Our academic relations team will reach out via <strong>{formData.email}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        orgOrChannel: "",
                        partnerType: "Campus Ambassador",
                        communitySize: "1,000 - 5,000",
                        website: "",
                        proposal: "",
                      });
                    }}
                    className="text-xs font-semibold text-[#007BA7] dark:text-sb-cyan hover:underline"
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Partner Application Form
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Sharma"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                  />
                  {errors.name && <p className="text-[0.72rem] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional / Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@college.edu or name@community.org"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                  />
                  {errors.email && <p className="text-[0.72rem] text-rose-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization / Channel *
                    </label>
                    <input
                      type="text"
                      value={formData.orgOrChannel}
                      onChange={(e) => setFormData({ ...formData, orgOrChannel: e.target.value })}
                      placeholder="e.g. ACM Student Chapter"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                    />
                    {errors.orgOrChannel && <p className="text-[0.72rem] text-rose-500 mt-1">{errors.orgOrChannel}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Partner Track
                    </label>
                    <select
                      value={formData.partnerType}
                      onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c101d] px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                    >
                      <option value="Campus Ambassador">Campus Ambassador</option>
                      <option value="Student Tech Society">Student Tech Society</option>
                      <option value="Educational Creator">Educational Creator</option>
                      <option value="University Placement Cell">University Placement Cell</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website or Community Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourclub.edu or linkedin.com/in/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Collaboration Proposal *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.proposal}
                    onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                    placeholder="Tell us about your student community, upcoming workshops, and how you plan to introduce SkillBridge..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#007BA7] dark:focus:border-sb-cyan"
                  />
                  {errors.proposal && <p className="text-[0.72rem] text-rose-500 mt-1">{errors.proposal}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007BA7] to-[#00A3D7] dark:from-sb-cyan dark:to-sb-pink text-white dark:text-black font-semibold text-xs sm:text-sm py-3 shadow-md hover:opacity-95 transition-opacity"
                >
                  <Send size={15} />
                  <span>Submit Partnership Application</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <CinematicFooter />
    </div>
  );
}
