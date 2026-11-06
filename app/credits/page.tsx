import { pageMeta } from '@/lib/seo';
import { credits } from '@/lib/credits';
import SplitHeading from '@/components/animations/SplitHeading';

export const metadata = pageMeta({
  title: 'Photo & video credits',
  description: 'Credits and licences for the photos and videos used on the Bir Paragliding website.',
  path: '/credits',
});

export default function CreditsPage() {
  return (
    <section className="container-x pb-24 pt-36 md:pt-44">
      <p className="hud text-dawn">Thank you, photographers</p>
      <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.6rem,7vw,6rem)]">
        Photo & video credits
      </SplitHeading>
      <p className="mt-6 max-w-2xl text-white/70">
        Images and footage on this site come from Wikimedia Commons under free licences (CC BY / CC BY-SA / CC0). Swap in your own photos any time — just replace the files in <code className="font-mono text-sun">/public/images</code> and <code className="font-mono text-sun">/public/media</code>.
      </p>
      <div className="no-scrollbar mt-12 overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="hud text-white/45">
            <tr>
              <th className="py-3 pr-4 font-normal">Used as</th>
              <th className="py-3 pr-4 font-normal">Original</th>
              <th className="py-3 pr-4 font-normal">Author</th>
              <th className="py-3 font-normal">Licence</th>
            </tr>
          </thead>
          <tbody>
            {credits.map((c) => (
              <tr key={c.file} className="border-t border-white/10 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white/60">{c.file}</td>
                <td className="py-3 pr-4">
                  <a href={c.source} target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4 hover:text-sun">
                    {c.title}
                  </a>
                </td>
                <td className="py-3 pr-4 text-white/75">{c.author || 'See source'}</td>
                <td className="py-3">
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="hover:text-sun">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
