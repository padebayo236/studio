
export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our intuitive system is designed to be easy to set up and use,
              so you can start managing your farm more effectively right away.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">1</div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Add Workers</h3>
              <p className="text-sm text-muted-foreground">
                Create profiles for all your farm workers in the system.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">2</div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Assign Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Assign specific farm tasks and set deadlines for completion.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">3</div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Track & Monitor</h3>
              <p className="text-sm text-muted-foreground">
                Workers log attendance and output, giving you real-time data.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">4</div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Generate Reports</h3>
              <p className="text-sm text-muted-foreground">
                Automate payroll and generate productivity reports instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
