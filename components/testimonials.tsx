"use client";

import { useState } from "react";
import useMasonry from "@/utils/useMasonry";
import Image, { StaticImageData } from "next/image";
import TestimonialImg01 from "@/public/images/testimonial-01.jpg";
import TestimonialImg02 from "@/public/images/testimonial-02.jpg";
import TestimonialImg03 from "@/public/images/testimonial-03.jpg";
// import TestimonialImg04 from "@/public/images/testimonial-04.jpg";
// import TestimonialImg05 from "@/public/images/testimonial-05.jpg";
// import TestimonialImg06 from "@/public/images/testimonial-06.jpg";
// import TestimonialImg07 from "@/public/images/testimonial-07.jpg";
// import TestimonialImg08 from "@/public/images/testimonial-08.jpg";
// import TestimonialImg09 from "@/public/images/testimonial-09.jpg";
import ClientImg01 from "@/public/images/client-logo-01.svg";
import ClientImg02 from "@/public/images/client-logo-02.svg";
import ClientImg03 from "@/public/images/client-logo-03.svg";
// import ClientImg04 from "@/public/images/client-logo-04.svg";
// import ClientImg05 from "@/public/images/client-logo-05.svg";
// import ClientImg06 from "@/public/images/client-logo-06.svg";
// import ClientImg07 from "@/public/images/client-logo-07.svg";
// import ClientImg08 from "@/public/images/client-logo-08.svg";
// import ClientImg09 from "@/public/images/client-logo-09.svg";

const testimonials = [
  {
    img: TestimonialImg01,
    name: "Alex R.",
    company: "Harvard University",
    content:
      "This app transformed how I study. I can upload lecture PDFs and instantly have interactive flashcards ready to review!",
  },
  {
    img: TestimonialImg03,
    name: "Priya S.",
    company: "IIT Bombay",
    content:
      "Flipping cards to test myself has never been easier. The AI accurately picks key points from my notes, saving me hours.",
  },
  {
    img: TestimonialImg02,
    name: "Daniel K.",
    company: "Self-Learner",
    content:
      "I love how I can organize my flashcards by topic. It makes revising for exams so much faster and more effective.",
  },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-400/.25),transparent)1] md:py-20">
        {/* Section header */}
        <div className="mx-auto max-w-3xl pb-12 text-center">
	          <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
	            What our users say
	          </h2>
	          <p className="text-lg text-indigo-200/65">
	            Students and professionals love how quickly they can turn notes into flashcards and boost their learning.
	          </p>
        </div>

        <div>

          {/* Cards */}
          <div
            className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
            ref={masonryContainer}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <Testimonial testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonial({
  testimonial,
  children,
}: {
  testimonial: {
    img: StaticImageData;
    name: string;
    company: string;
    content: string;
  };
  children: React.ReactNode;
}) {
  return (
    <article
      className={`relative rounded-2xl bg-linear-to-br from-gray-900/50 via-gray-800/25 to-gray-900/50 p-5 backdrop-blur-xs transition-opacity before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] ""`}
    >
      <div className="flex flex-col gap-4">
        <p className="text-indigo-200/65 before:content-['“'] after:content-['”']">
          {children}
        </p>
        <div className="flex items-center gap-3">
          <Image
            className="inline-flex shrink-0 rounded-full"
            src={testimonial.img}
            width={36}
            height={36}
            alt={testimonial.name}
          />
          <div className="text-sm font-medium text-gray-200">
            <span>{testimonial.name}</span>
            <span className="text-gray-700"> - </span>
            <a
              className="text-indigo-200/65 transition-colors hover:text-indigo-500"
              href="#0"
            >
              {testimonial.company}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
