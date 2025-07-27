// TODO: THIS IS THE LANDING PAGE THAT THE USER WILL ALWAYS FIRST SEE. make sure to update this page
// Make sure that the marketing text always reflects the app marketing. create an aesthetic properly-designed landing page that fits the theme of the app
// start completely from scratch to make this landing page using aesthetic design principles and tailwind styling to create a unique and thematic landing page.

import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart, Group, MessageSquare, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      <header className="py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lovable</h1>
        <AuthButton
          trigger={<Button>Get Started</Button>}
          dashboardTrigger={<Button variant="ghost">Dashboard</Button>}
        />
      </header>

      <main>
        <section className="text-center py-20 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-4"
          >
            Empowering Small Businesses, Together.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Lovable is a platform that connects vendors, wholesalers, and
            investors to streamline raw material sourcing and build a financial
            ecosystem of trust and transparency.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AuthButton
              trigger={
                <Button size="lg">
                  Join Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              }
            />
          </motion.div>
        </section>

        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Group className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h4 className="text-xl font-semibold mb-2">Group Buying</h4>
                <p className="text-muted-foreground">
                  Join forces with nearby vendors to get bulk pricing on raw
                  materials.
                </p>
              </div>
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h4 className="text-xl font-semibold mb-2">AI Translations</h4>
                <p className="text-muted-foreground">
                  Communicate seamlessly with suppliers in Hindi, English, or
                  Marathi.
                </p>
              </div>
              <div className="text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h4 className="text-xl font-semibold mb-2">Trust Score</h4>
                <p className="text-muted-foreground">
                  Build your reputation with on-time repayments and positive
                  reviews.
                </p>
              </div>
              <div className="text-center">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h4 className="text-xl font-semibold mb-2">
                  Investor Dashboard
                </h4>
                <p className="text-muted-foreground">
                  Access loan requests with data-driven insights to make smart
                  investments.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 px-4 border-t">
        <p>&copy; {new Date().getFullYear()} Lovable. All rights reserved.</p>
      </footer>
    </div>
  );
}