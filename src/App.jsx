import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zhivpkjrgobfwzvcclnb.supabase.co",
  "sb_publishable_KsiY5dGDvyqVcBfp8usNMw_HOLU_Mfr"
);

const teams = [
  "กฟน.1","กฟน.2","กฟน.3",
  "กฟฉ.1","กฟฉ.2","กฟฉ.3",
  "กฟก.1","กฟก.2","กฟก.3",
  "กฟต.1","กฟต.2","กฟต.3"
];

const judges = [
  {name:"นางนงลักษณ์ สุวรรณจำรัส",email:"admin@pea.co.th",password:"test1",role:"ประธาน"},
  {name:"ทีมงาน กบร./ ศฝฟ.",email:"assist@pea.co.th",password:"test14",role:"ผู้ช่วยกรรมการ"}
];

export default function App(){

  const [rows,setRows] = useState([]);
  const [loggedIn,setLoggedIn] = useState(false);
  const [loginEmail,setLoginEmail] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [user,setUser] = useState("");

  const current = judges.find(j=>j.name===user);
  const isAssistant = current?.role === "ผู้ช่วยกรรมการ";

  const [f,setF] = useState({
    team:teams[0],
    category:"onsite",
    score:"",
    signed:false
  });

  useEffect(()=>{
    if(loggedIn) loadScores();
  },[loggedIn]);

  async function loadScores(){
    const {data} = await supabase.from("scores").select("*");
    setRows(data || []);
  }

  function loginJudge(){
    const judge = judges.find(
      j => j.email === loginEmail && j.password === loginPassword
    );

    if(!judge){
      alert("เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    setUser(judge.name);
    setLoggedIn(true);
  }

  async function addScore(){

    const payload = {
      team:f.team,
      category:f.category,
      score:Number(f.score || 0),
      judge:user,
      role:current?.role,
      created_at:new Date().toISOString()
    };

    const {error} = await supabase
      .from("scores")
      .insert([payload]);

    if(error){
      alert(error.message);
      return;
    }

    await loadScores();
    alert("บันทึกสำเร็จ");
  }

  const ranking = useMemo(()=>{
    return teams.map(team=>{
      const rs = rows.filter(r=>r.team===team);
      const total = rs.reduce((s,r)=>s+Number(r.score||0),0);
      return {team,total};
    }).sort((a,b)=>b.total-a.total);
  },[rows]);

  if(!loggedIn){
    return (
      <div style={{padding:40}}>
        <h1>Login</h1>
        <input
          placeholder="Email"
          value={loginEmail}
          onChange={e=>setLoginEmail(e.target.value)}
        />
        <br/><br/>
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={e=>setLoginPassword(e.target.value)}
        />
        <br/><br/>
        <button onClick={loginJudge}>Login</button>
      </div>
    );
  }

  return (
    <div style={{padding:30}}>
      <h1>Operation & Maintenance Score System</h1>

      <p>ผู้ใช้งาน: {user} ({current?.role})</p>

      <select
        value={f.team}
        onChange={e=>setF({...f,team:e.target.value})}
      >
        {teams.map(t=><option key={t}>{t}</option>)}
      </select>

      <input
        type="number"
        placeholder="คะแนน"
        value={f.score}
        onChange={e=>setF({...f,score:e.target.value})}
      />

      <label>
        <input
          type="checkbox"
          checked={f.signed}
          onChange={e=>setF({...f,signed:e.target.checked})}
        />
        ยืนยันคะแนน
      </label>

      <button disabled={!f.signed} onClick={addScore}>
        บันทึกคะแนน
      </button>

      <h2>Ranking</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>อันดับ</th>
            <th>ทีม</th>
            <th>คะแนนรวม</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r,i)=>(
            <tr key={r.team}>
              <td>{i+1}</td>
              <td>{r.team}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
