import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "커뮤니티 - 로보틱스 포털",
  description: "로봇공학 전문가와 입문자들을 위한 커뮤니티 공간입니다.",
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="py-8">
      {children}
    </section>
  )
} 