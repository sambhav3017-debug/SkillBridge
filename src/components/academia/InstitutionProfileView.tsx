"use client";

import { useState } from "react";
import { Loader2, Save, ShieldCheck, Upload } from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { InstitutionVerificationBadge } from "./AcademiaOnboardingWizard";
import {
  Avatar,
  ErrorNote,
  PageHeader,
  SelectField,
  TagInput,
  TextAreaField,
  TextField,
} from "@/components/student/ui";
import { imageToAvatar } from "@/lib/student/image";
import { INSTITUTION_TYPES, type InstitutionType } from "@/lib/academia/types";

export default function InstitutionProfileView() {
  const { data, updateMe, notify } = useAcademia();
  const { institution, staff } = data;
  const canEdit = ["Institution Owner", "Institution Administrator", "Placement Officer"].includes(staff.role);

  const [name, setName] = useState(institution.name);
  const [type, setType] = useState<InstitutionType>(institution.type);
  const [logo, setLogo] = useState(institution.logo);
  const [website, setWebsite] = useState(institution.website);
  const [institutionalEmail, setInstitutionalEmail] = useState(institution.institutionalEmail);
  const [country, setCountry] = useState(institution.country);
  const [state, setState] = useState(institution.state);
  const [city, setCity] = useState(institution.city);
  const [address, setAddress] = useState(institution.address);
  const [description, setDescription] = useState(institution.description);
  const [specializations, setSpecializations] = useState<string[]>(institution.specializations);
  const [programsOffered, setProgramsOffered] = useState<string[]>(institution.programsOffered);
  const [accreditation, setAccreditation] = useState(institution.accreditation);
  const [affiliation, setAffiliation] = useState(institution.affiliation);
  const [contactPersonName, setContactPersonName] = useState(institution.contactPersonName);
  const [contactPersonTitle, setContactPersonTitle] = useState(institution.contactPersonTitle);
  const [placementOfficeEmail, setPlacementOfficeEmail] = useState(institution.placementOfficeEmail);
  const [placementOfficePhone, setPlacementOfficePhone] = useState(institution.placementOfficePhone);

  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setErrors({});
    setTopError(null);
    setBusy(true);
    const res = await updateMe({
      institution: {
        name,
        type,
        logo,
        website,
        institutionalEmail,
        country,
        state,
        city,
        address,
        description,
        specializations,
        programsOffered,
        accreditation,
        affiliation,
        contactPersonName,
        contactPersonTitle,
        placementOfficeEmail,
        placementOfficePhone,
      },
    });
    setBusy(false);
    if (!res.ok) {
      setTopError(res.error);
      if (res.fieldErrors) setErrors(res.fieldErrors);
      return;
    }
    notify("success", "Institution profile saved.");
  };

  const handleSubmitVerification = async () => {
    setVerifying(true);
    const res = await updateMe({
      institution: {
        name,
        website,
        city,
        submitForVerification: true,
      },
    });
    setVerifying(false);
    if (res.ok) notify("success", "Submitted institution profile for verification review.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Profile & Verification"
        subtitle="Manage your official university or college identity, degree programs, accreditation, and Placement Cell contact details."
        action={<InstitutionVerificationBadge status={institution.verificationStatus} />}
      />

      {topError && <ErrorNote>{topError}</ErrorNote>}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-12" noValidate>
        <div className="glass space-y-5 p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-4">
              <Avatar name={name || "Inst"} src={logo} size={64} />
              <div>
                <h2 className="text-lg font-bold">{name || "Your Institution"}</h2>
                <p className="text-xs text-sb-muted">
                  {type} · {city}
                  {state ? `, ${state}` : ""}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <label className="btn btn-glass btn-sm cursor-pointer">
                  <Upload size={14} /> Upload Crest / Logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        setLogo(await imageToAvatar(f));
                      } catch (err) {
                        notify("error", err instanceof Error ? err.message : "Could not load logo.");
                      }
                    }}
                  />
                </label>
                {logo && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogo("")}>
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Official institution name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.institutionName}
              disabled={!canEdit}
              required
            />
            <SelectField
              label="Institution type"
              options={INSTITUTION_TYPES}
              value={type}
              onChange={(e) => setType(e.target.value as InstitutionType)}
              disabled={!canEdit}
            />
            <TextField
              label="Official website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              error={errors.website}
              disabled={!canEdit}
              required
            />
            <TextField
              label="Institutional email"
              type="email"
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              disabled={!canEdit}
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={!canEdit}
            />
            <TextField
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={!canEdit}
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!canEdit}
            />
            <TextField
              label="Campus Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!canEdit}
            />
          </div>

          <TextAreaField
            label="Institution Overview"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit}
          />

          <TagInput
            label="Programs Offered"
            value={programsOffered}
            onChange={setProgramsOffered}
            placeholder="B.Tech / B.E., M.Tech, MBA…"
          />

          <TagInput
            label="Areas of Specialization"
            value={specializations}
            onChange={setSpecializations}
            placeholder="Computer Science, AI, Electronics…"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Accreditation Details"
              optional
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
              disabled={!canEdit}
            />
            <TextField
              label="Affiliation Details"
              optional
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              disabled={!canEdit}
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-3 text-base font-bold">Placement Office &amp; Authorized Representative</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Authorized Contact Person"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                disabled={!canEdit}
              />
              <TextField
                label="Designation"
                value={contactPersonTitle}
                onChange={(e) => setContactPersonTitle(e.target.value)}
                disabled={!canEdit}
              />
              <TextField
                label="Placement Office Email"
                type="email"
                value={placementOfficeEmail}
                onChange={(e) => setPlacementOfficeEmail(e.target.value)}
                disabled={!canEdit}
              />
              <TextField
                label="Placement Office Phone"
                optional
                value={placementOfficePhone}
                onChange={(e) => setPlacementOfficePhone(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end border-t border-white/10 pt-4">
              <button type="submit" disabled={busy} className="btn btn-primary">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Institution Profile
              </button>
            </div>
          )}
        </div>

        {/* Verification Panel */}
        <div className="space-y-5 lg:col-span-4">
          <div className="glass space-y-4 p-6">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-sb-cyan" />
              <h3 className="text-base font-bold">Verification Status</h3>
            </div>
            <InstitutionVerificationBadge status={institution.verificationStatus} />
            <p className="text-xs leading-relaxed text-sb-muted">
              SkillBridge never fabricates accreditation records or falsely marks an institution as verified without an
              authorized review. Submitting your profile transitions it from <strong className="text-white">Draft</strong>{" "}
              to <strong className="text-sb-cyan">Pending Verification</strong>.
            </p>
            {institution.verificationNote && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-sb-muted">
                {institution.verificationNote}
              </p>
            )}
            {canEdit && institution.verificationStatus === "Draft" && (
              <button
                type="button"
                disabled={verifying}
                onClick={handleSubmitVerification}
                className="btn btn-glass btn-sm w-full"
              >
                {verifying && <Loader2 size={14} className="animate-spin" />}
                Submit for Verification Review
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
