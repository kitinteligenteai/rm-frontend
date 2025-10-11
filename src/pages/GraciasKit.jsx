<form
  className="mt-6 space-y-5"
  noValidate
  autoComplete="off"              // <- apaga autocomplete del form
  onSubmit={handleSubmit(onSubmit)}
>
  {/* Email */}
  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
      Correo electrónico
    </label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        id="email"
        name="email"
        type="email"
        placeholder="nombre@correo.com"
        className="w-full bg-transparent outline-none border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
        inputMode="email"
        // AUTOCOMPLETE “aislado” para que Chrome no copie al segundo campo
        autoComplete="section-email email"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        {...register("email", {
          required: "El correo es obligatorio.",
          setValueAs: (v) => String(v ?? "").trim().toLowerCase(),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            message: "Introduce un correo válido."
          }
        })}
      />
    </div>
    {errors.email && (
      <p className="mt-2 text-sm text-yellow-400">{errors.email.message}</p>
    )}
  </div>

  {/* Confirm Email */}
  <div>
    <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-400 mb-1">
      Confirma tu correo
    </label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        id="confirmEmail"
        name="confirmEmail"
        type="email"
        placeholder="Vuelve a escribir tu correo"
        className="w-full bg-transparent outline-none border border-gray-700 focus:border-teal-500 transition rounded-lg pl-10 pr-3 py-3"
        inputMode="email"
        // Le damos OTRA “sección” para que el navegador no intente autocompletarlo igual
        autoComplete="section-confirm email"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        {...register("confirmEmail", {
          required: "Confirma tu correo.",
          setValueAs: (v) => String(v ?? "").trim().toLowerCase(),
          validate: (v, formValues) =>
            v === (formValues?.email ?? "") || "Los correos no coinciden."
        })}
      />
    </div>
    {errors.confirmEmail && (
      <p className="mt-2 text-sm text-yellow-400">{errors.confirmEmail.message}</p>
    )}
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={isSubmitting || !isValid}
    className="w-full flex items-center justify-center rounded-lg bg-teal-600 hover:bg-teal-500 px-6 py-4 font-semibold disabled:bg-gray-700 disabled:opacity-60 transition"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin mr-3" />
        Procesando…
      </>
    ) : (
      "Confirmar y Recibir mi Kit"
    )}
  </button>

  <p className="text-xs text-gray-400 text-center">
    Usaremos este correo sólo para enviarte tu acceso y soporte.
  </p>
</form>
