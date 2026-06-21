import { notFound } from "next/navigation";
import { Zap } from "lucide-react";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Brand from "@/models/Brand";

export const dynamic = "force-dynamic";

interface PublicBrand {
  _id: string;
  name: string;
  industry?: string;
  description?: string;
  dna?: { colors?: { primary?: string; secondary?: string; accent?: string; neutrals?: string[] } };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await connectDB();
  const user = await User.findOne({ profileSlug: slug, profilePublic: true }).lean<{
    _id: string;
    name: string;
    profileBio?: string;
    plan: string;
  } | null>();

  if (!user) notFound();

  const brands = (await Brand.find({ userId: user._id, status: "active" })
    .select("name industry description dna.colors createdAt")
    .lean()) as unknown as PublicBrand[];

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">MIQSX</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Profile header */}
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          {user.profileBio && <p className="text-text-muted mt-2 max-w-2xl">{user.profileBio}</p>}
          <p className="text-text-dim text-sm mt-3">
            {brands.length} brand{brands.length === 1 ? "" : "s"} · powered by MIQSX
          </p>
        </div>

        {/* Brands */}
        {brands.length === 0 ? (
          <p className="text-text-dim">No public brands to show yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {brands.map((b) => {
              const colors = b.dna?.colors;
              const swatches = [colors?.primary, colors?.secondary, colors?.accent, ...(colors?.neutrals ?? [])]
                .filter(Boolean)
                .slice(0, 5) as string[];
              return (
                <div key={b._id} className="rounded-2xl border border-border bg-surface p-5">
                  <h2 className="text-lg font-semibold">{b.name}</h2>
                  {b.industry && <p className="text-text-dim text-xs mt-0.5">{b.industry}</p>}
                  {b.description && <p className="text-text-muted text-sm mt-3 line-clamp-3">{b.description}</p>}
                  {swatches.length > 0 && (
                    <div className="flex gap-1.5 mt-4">
                      {swatches.map((c, i) => (
                        <span
                          key={`${c}-${i}`}
                          className="h-6 w-6 rounded-md border border-border"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
