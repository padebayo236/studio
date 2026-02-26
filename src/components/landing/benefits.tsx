
import { Check } from "lucide-react";

const benefits = [
  "Improves labor accountability and transparency",
  "Reduces manual record-keeping errors and saves time",
  "Provides real-time insights into farm productivity",
  "Supports data-driven decision-making for better outcomes",
  "Streamlines payroll processing and reduces administrative burden",
  "Enhances overall farm operational efficiency and profitability",
];

export function LandingBenefits() {
  return (
    <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Why Choose AgriPro Manager?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Move beyond guesswork and manage your farm with confidence, backed by
            reliable data and powerful tools.
          </p>
        </div>
        <div className="mx-auto max-w-3xl w-full">
            <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-left">
                <Check className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                <span>{benefit}</span>
                </li>
            ))}
            </ul>
        </div>
      </div>
    </section>
  );
}
