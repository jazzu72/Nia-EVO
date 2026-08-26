import Link from "next/link";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",padding:"40px",fontFamily:"system-ui"}}>
      <h1>Money Munchkins: Quantum Odyssey</h1>
      <p>Learn money. Make choices. Build your future.</p>
      <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"30px"}}>
        <Link href="/pilot">🎮 Play Quantum Odyssey</Link>
        <Link href="/parent">👨‍👩‍👧 Parent Portal</Link>
        <Link href="/investor">📊 Investor Dashboard</Link>
      </div>
    </main>
  );
}
