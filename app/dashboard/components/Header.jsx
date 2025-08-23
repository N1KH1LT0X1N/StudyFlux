
function Header() {

    return (
      <header className="mt-10 mx-auto max-w-3xl pb-12 text-center md:pb-20">
      <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
      <h1
        className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl"
        data-aos="fade-up"
      >
      	DocInsight
      </h1>
      </div>
      <p
        className="mb-8 text-xl text-indigo-200/65"
        data-aos="fade-up"
        data-aos-delay={200}
      >
      Learn from PDF documents and images
      </p>

      </header>
    )
  }

  export default Header
