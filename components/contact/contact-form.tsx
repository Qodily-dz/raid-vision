"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { BUDGET_OPTIONS } from "@/lib/i18n/budget";
import { submitContactInquiry, type ContactActionState } from "@/lib/actions/contact";
import { idleState } from "@/lib/actions/state";
import type { ServiceView } from "@/types/content";
import Field from "@/components/ui/field";
import SubmitButton from "@/components/ui/submit-button";

type ContactFormProps = {
  locale: string;
  services: ServiceView[];
  /** Pre-selects a service, e.g. from `?service=<id>` on the services page. */
  defaultServiceId?: string;
};

const INITIAL: ContactActionState = idleState;

/**
 * Public enquiry form.
 *
 * Progressive enhancement: a real `<form>` posting through a server action, with
 * `useActionState` reporting field-level errors back without a page reload.
 *
 * The form lives in a keyed child so "send another" can mount a fresh instance —
 * `useActionState` has no reset, and a new key is the honest way to get one.
 */
export default function ContactForm(props: ContactFormProps) {
  const [instance, setInstance] = useState(0);

  return <ContactFormFields key={instance} {...props} onAnother={() => setInstance((n) => n + 1)} />;
}

function ContactFormFields({
  locale,
  services,
  defaultServiceId,
  onAnother,
}: ContactFormProps & { onAnother: () => void }) {
  const dict = getDictionary(locale);
  const [state, formAction] = useActionState(submitContactInquiry, INITIAL);
  const errorRef = useRef<HTMLDivElement>(null);
  const messages = dict.contact.validation;
  const errors = state.ok ? undefined : state.errors;

  // Only pre-select a service that actually exists, so the server never sees an
  // arbitrary id in the payload.
  const selectedService = services.some((service) => service.id === defaultServiceId)
    ? defaultServiceId
    : "";

  // Send focus to the failure summary so it is announced, not just painted.
  useEffect(() => {
    if (state.ok || !state.code) return;
    errorRef.current?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div className="frame p-8 sm:p-10">
        <span className="kicker text-violet">200 OK</span>
        <h3 className="display mt-4 text-3xl">{dict.contact.successTitle}</h3>
        <p className="mt-3 max-w-measure text-ink-dim">{dict.contact.successBody}</p>
        <button type="button" onClick={onAnother} className="btn btn-outline mt-8">
          {dict.contact.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {/* Honeypot: invisible to people, tempting for bots. The server drops it. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.code === "error" && !errors ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="border border-violet/40 bg-violet/5 p-4 text-sm"
        >
          <p className="kicker text-violet">{dict.contact.errorTitle}</p>
          <p className="mt-2 text-ink-dim">{messages.generic}</p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label={dict.contact.name}
          name="name"
          required
          error={errors?.name ? messages.name : undefined}
        >
          {({ id, name, describedBy, invalid }) => (
            <input
              id={id}
              name={name}
              type="text"
              className="input"
              required
              maxLength={120}
              autoComplete="name"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>

        <Field
          label={dict.contact.email}
          name="email"
          required
          error={errors?.email ? messages.email : undefined}
        >
          {({ id, name, describedBy, invalid }) => (
            <input
              id={id}
              name={name}
              type="email"
              className="input"
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              placeholder="name@example.com"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>

        <Field
          label={dict.contact.phone}
          name="phone"
          optional={dict.common.optional}
          error={errors?.phone ? messages.phone : undefined}
        >
          {({ id, name, describedBy, invalid }) => (
            <input
              id={id}
              name={name}
              type="tel"
              className="input"
              maxLength={40}
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="+00 000 000 000"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>

        <Field
          label={dict.contact.company}
          name="company"
          optional={dict.common.optional}
          error={errors?.company ? messages.generic : undefined}
        >
          {({ id, name, describedBy, invalid }) => (
            <input
              id={id}
              name={name}
              type="text"
              className="input"
              maxLength={120}
              autoComplete="organization"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>

        <Field
          label={dict.contact.service}
          name="serviceId"
          optional={dict.common.optional}
        >
          {({ id, name, describedBy }) => (
            <select
              id={id}
              name={name}
              defaultValue={selectedService}
              className="select"
              aria-describedby={describedBy}
            >
              <option value="">{dict.contact.servicePlaceholder}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label={dict.contact.budget} name="budget" optional={dict.common.optional}>
          {({ id, name, describedBy }) => (
            <select
              id={id}
              name={name}
              className="select"
              defaultValue=""
              aria-describedby={describedBy}
            >
              <option value="">{dict.contact.budgetPlaceholder}</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {dict.contact.budgetOptions[option.labelKey]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field label={dict.contact.projectDate} name="projectDate" optional={dict.common.optional}>
        {({ id, name, describedBy }) => (
          <input
            id={id}
            name={name}
            type="date"
            className="input"
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Field
        label={dict.contact.message}
        name="message"
        required
        error={
          errors?.messageShort
            ? messages.messageShort
            : errors?.messageLong
              ? messages.messageLong
              : undefined
        }
      >
        {({ id, name, describedBy, invalid }) => (
          <textarea
            id={id}
            name={name}
            required
            rows={6}
            className="textarea"
            maxLength={5000}
            placeholder={dict.contact.messagePlaceholder}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton
          pendingLabel={dict.contact.sending}
          className="btn btn-violet"
        >
          {dict.contact.submit}
        </SubmitButton>

        <p aria-live="polite" className="font-mono text-[0.6rem] tracking-[0.15em] text-ink-faint">
          {errors || state.code === "error"
            ? dict.contact.errorBody
            : `${dict.contact.name} *  ·  ${dict.contact.email} *  ·  ${dict.contact.message} *`}
        </p>
      </div>
    </form>
  );
}