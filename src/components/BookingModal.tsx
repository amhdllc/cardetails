import { useState } from "react";

export default function BookingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md border border-[#8c7853]/40 bg-[#12110f] p-8 text-[#f3efe8]">
        <button
          onClick={() => {
            setSubmitted(false);
            onClose();
          }}
          className="absolute top-5 right-5 text-xs tracking-widest text-[#9e8c6c] hover:text-white"
        >
          ESC
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-[10px] tracking-[0.28em] text-[#9e8c6c] uppercase">
              REQUEST RECEIVED
            </p>
            <h3 className="font-serif-display mt-3 text-3xl">
              We will be in touch shortly.
            </h3>
            <p className="mt-3 text-xs text-[#b8b0a2]">
              A specialist will confirm your vehicle package and studio slot.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <p className="text-[10px] tracking-[0.28em] text-[#9e8c6c] uppercase">
              RESERVE STUDIO TIME
            </p>
            <h3 className="font-serif-display text-3xl">Book a Detail</h3>

            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#b8b0a2] uppercase">
                Full Name
              </label>
              <input
                required
                type="text"
                placeholder="Alex Mercer"
                className="mt-1 w-full border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#9e8c6c]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#b8b0a2] uppercase">
                Vehicle Make & Model
              </label>
              <input
                required
                type="text"
                placeholder="Porsche 911 GT3 / Mercedes-AMG"
                className="mt-1 w-full border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#9e8c6c]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#b8b0a2] uppercase">
                Treatment Package
              </label>
              <select className="mt-1 w-full border border-white/15 bg-[#12110f] px-3 py-2 text-sm text-white outline-none focus:border-[#9e8c6c]">
                <option>Full Concours Paint Correction + 9H Ceramic</option>
                <option>Multi-Stage Paint Correction</option>
                <option>Interior Leather & Touchpoint Restoration</option>
                <option>Maintenance Protection Detail</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#b8b0a2] uppercase">
                Phone or Email
              </label>
              <input
                required
                type="text"
                placeholder="+32 470 00 00 00"
                className="mt-1 w-full border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#9e8c6c]"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full border border-[#9e8c6c] bg-[#9e8c6c]/20 py-3 text-[11px] font-medium tracking-[0.25em] text-[#f5f0e6] uppercase transition hover:bg-[#9e8c6c]/35"
            >
              REQUEST APPOINTMENT
            </button>
          </form>
        )}
      </div>
    </div>
  );
}