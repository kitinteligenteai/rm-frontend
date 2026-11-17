export async function saleAlerts(
  db: any,
  payment: any,
  env: (key: string) => string | undefined,
) {
  const bark = env("BARK_URL");
  const topic = env("NTFY_TOPIC");
  if (!bark && !topic) return;
  const id = String(payment.id);
  const { error } = await db
    .from("admin_notifications_log")
    .insert({
      provider_payment_id: id,
      channel: "sale",
      meta: { delivery: "processing" },
    });
  if (error) return; // Unique payment key deduplicates concurrent webhook deliveries.
  const text = `Venta RM: ${payment.metadata.product_type} | ${payment.transaction_amount} ${payment.currency_id} | pago ${id}`;
  const failures = [];
  if (bark) {
    try {
      const response = await fetch(
        `${bark.replace(/\/+$/, "")}/${encodeURIComponent("Venta Reinicio Metabólico")}/${encodeURIComponent(text)}?group=ventas-rm`,
      );
      if (!response.ok) failures.push("bark");
    } catch {
      failures.push("bark");
    }
  }
  if (topic) {
    try {
      const response = await fetch(
        `https://ntfy.sh/${encodeURIComponent(topic)}`,
        { method: "POST", headers: { Title: "Venta RM" }, body: text },
      );
      if (!response.ok) failures.push("ntfy");
    } catch {
      failures.push("ntfy");
    }
  }
  // Failed alerts are reconciled manually; never fail payment fulfillment to retry a notification.
  await db
    .from("admin_notifications_log")
    .update({
      meta: {
        delivery: failures.length ? "needs_review" : "sent",
        failed_channels: failures,
      },
    })
    .eq("provider_payment_id", id);
}
