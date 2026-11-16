import { useState } from "react";
import CarShowroom from "./components/CarShowroom";
import BookingModal from "./components/BookingModal";

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <main id="top" className="min-h-screen bg-[#0d0c0b]">
      <CarShowroom onBookClick={() => setBookingOpen(true)} />

      {/* Closing Footer Section after the Scroll Experience */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center border-t border-white/10 bg-[#0d0c0b] px-6 text-center">
        <p className="text-[10px] tracking-[0.3em] text-[#9e8c6c] uppercase">
          BY APPOINTMENT ONLY
        </p>
        <h2 className="font-serif-display mt-4 max-w-xl text-4xl text-[#f5f0e6] md:text-6xl">
          Preserve the finish your car deserves.
        </h2>
        <button
          onClick={() => setBookingOpen(true)}
          className="mt-8 border border-[#8c7853] px-8 py-3.5 text-xs tracking-[0.25em] text-[#f5f0e6] uppercase transition hover:bg-[#8c7853]/20"
        >
          BOOK A DETAIL
        </button>
      </section>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}