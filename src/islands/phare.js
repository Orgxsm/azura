// islands/phare.js — Île du Phare · Astra · livraison 2
// Base publique : ab3c583. Coordonnées en mètres, Y vertical, mer Y=0.
// Centre {x:34,z:-18} ; rayon nominal 12, englobant 14.
// Enveloppe du relief : x∈[20,48], z∈[-32,-4].
// Ponton EXISTANT géré par archipel.js : centre (34,.60,-5),
// heading=Math.atan2(-38.2,20), 0 vers +Z. Aucun ponton construit ici.
// Apparition inchangée : {x:35.8,y:.56,z:-7.4,heading:Math.PI}.
// Raccord terre : (35.8,.56,-6.2). Crique sud-est conservée plane.
// Phare : pied (34,12.5,-25.3), galerie Y=18.7, foyer (34,19.45,-25.3).
// Gardien souhaité : {id:'gardien',x:33.2,y:12.5,z:-23.2,heading:.4,scale:1}.
// Chèvres souhaitées (positions sur paliers, adapter le leash aux chemins) :
//   {id:'chevre-1',x:37.9,y:3.6,z:-12.4,heading:2.2,scale:1}
//   {id:'chevre-2',x:32.2,y:7,z:-14.8,heading:-.4,scale:.85}
//   {id:'chevre-3',x:36.5,y:10.3,z:-19.3,heading:1.7,scale:.95}
//
// Intégration Claude (sans modification de game.js/render.js ici) :
// - npcMeshes.gardien : 6 os, poseHuman, scale 1.
// - goatMesh : 7 os, poseGoat(e,t), pivots décrits dans rig.js/anim.js.
// - après poseHuman(gardien,t), pousser gardienLanternDraw(gardien) dans drawList.
// - pousser phareLanternDraw(t, phareAllume) si non-null dans drawList.
// Ces deux descripteurs utilisent mode:7 et noShadow:true. L'émission attend
// ces branchements ; la structure et le verre ambre restent visibles sans eux.
// Aucun accès forcé à drawList, aucune quête inventée et aucun faisceau ajouté.
// platforms est déjà rendu dans island.js : les nouveaux socles sont donc
// matérialisés explicitement ici ET déclarés pour la carte de hauteur.
// Vérification GPU/praticabilité archipel à faire sur la version locale de Claude.
{
  const pharePreviousSeed = seed;
  seed = 341809;
  try {
    const CX = 34, CZ = -18;
    const radialSteps = 80, angularSteps = 128;
    const climb = [[35.8,.56,-8.8],[37.5,3.6,-12.5],[32.5,7,-15.5],
      [36.5,10.3,-20],[34,12.5,-23]];
    const landings = [
      {x:37.5,y:3.6,z:-12.5,r:1.35}, {x:32.5,y:7,z:-15.5,r:1.35},
      {x:36.5,y:10.3,z:-20,r:1.35}, {x:34,y:12.5,z:-23,r:1.65},
      {x:34,y:12.5,z:-25.3,r:1.8},
      {x:40,y:3.6,z:-12.8,r:2}, {x:29.7,y:7,z:-16,r:2},
      {x:39.8,y:10.3,z:-20.5,r:2.05}
    ];
    const paths = [climb,
      [[37.5,3.6,-12.5],[37.7,3.6,-10.9],[40,3.6,-11.15]],
      [[32.5,7,-15.5],[32,7,-14.25],[29.7,7,-14.25]],
      [[36.5,10.3,-20],[36.7,10.3,-18.6],[39.8,10.3,-18.75]]];
    function nearestSegment(x,z,a,b) {
      const dx=b[0]-a[0],dz=b[2]-a[2];
      const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));
      return {d:Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz),y:a[1]+t*(b[1]-a[1])};
    }
    const smooth = t => { t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };

    // Côte irrégulière et avancée sableuse au sud-est pour le futur ponton.
    function coastRadius(a) {
      const delta = Math.atan2(Math.sin(a-1.42), Math.cos(a-1.42));
      return 11.45 + .32*Math.sin(3*a+.7) + .22*Math.cos(5*a)
        + 1.70*Math.exp(-delta*delta/.15);
    }
    function surfaceY(x,z,r) {
      const inland = smooth((1-r)/.23);
      // Trois ruptures de pente : vires larges et fronts de roche resserrés.
      const terracesY = 3.04*smooth((-z-10.7)/1.6)
        + 3.4*smooth((-z-14.3)/1.4) + 3.3*smooth((-z-18.6)/1.5)
        + 2.2*smooth((-z-22)/1.1);
      let height = .56+terracesY*inland;
      height += .18*Math.sin(x*.83+z*.3)*Math.sin(terracesY*.75)*inland;
      height -= 1.36*smooth((r-.94)/.06);
      // Tailler le massif SOUS les escaliers : le personnage ne disparaît pas
      // dans le relief même si la carte tamponne correctement les marches.
      for(const path of paths) for(let i=1;i<path.length;i++) {
        const q=nearestSegment(x,z,path[i-1],path[i]);
        if(q.d<1.05) height=Math.min(height,q.y-.12);
      }
      for(const p of landings) if(Math.hypot(x-p.x,z-p.z)<p.r+.15)
        height=Math.min(height,p.y-.04);
      return height;
    }
    function point(r,a) {
      const radius = coastRadius(a)*r;
      const x = CX+Math.cos(a)*radius, z = CZ+Math.sin(a)*radius;
      return [x,surfaceY(x,z,r),z];
    }
    function material(p,r) {
      const north = smooth((-p[2]-10)/13);
      if(p[1]<.9 && (p[2]>-11 || r>.91)) return tint(palette.sand,.98);
      // Palette existante reconnue par le shader ; aucune nouvelle matière.
      const band = .95+.035*Math.sin(p[1]*2.6)+.018*Math.sin(p[0]*1.3+p[2]*.6);
      return tint(north>.66?palette.rockLight:palette.rock,band);
    }
    const rings = [];
    for(let j=0;j<=radialSteps;j++) {
      const r=j/radialSteps, row=[];
      for(let i=0;i<angularSteps;i++) row.push(point(r,i/angularSteps*TAU));
      rings.push(row);
    }
    // Winding vers +Y ; éventail central sans triangles dégénérés.
    const center = point(0,0);
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps;
      tri(center,rings[1][next],rings[1][i],material(center,0));
    }
    for(let j=1;j<radialSteps;j++) for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[j][i], b=rings[j][next];
      const c=rings[j+1][next], d=rings[j+1][i];
      const middle=[(a[0]+c[0])*.5,(a[1]+c[1])*.5,(a[2]+c[2])*.5];
      quad(a,b,c,d,material(middle,(j+.5)/radialSteps));
    }
    // Socle immergé fermé, pour les vues rasantes depuis le bateau.
    for(let i=0;i<angularSteps;i++) {
      const next=(i+1)%angularSteps, a=rings[radialSteps][i], b=rings[radialSteps][next];
      quad(a,[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],b,palette.rock);
      tri([CX,-2.4,CZ],[a[0],-2.4,a[2]],[b[0],-2.4,b[2]],palette.rock);
    }
    // Monolithes ancrés sur les flancs ; crique et plateau dégagés.
    for(const p of [
      [25.8,1.8,-17.7,2.1,3.0,3.4],
      [26.4,4.0,-22.2,1.8,4.1,2.5],
      [29.0,8.0,-26.2,2.1,4.0,2.1],
      [40.6,5.8,-25.5,1.5,4.6,1.8],
      [43.1,2.4,-20.5,1.3,3.4,2.0],
      [41.8,.9,-14.7,1.3,1.8,1.5],
      [28.2,.25,-11.6,1.0,.9,1.1]
    ]) rock(...p);
    // Éboulis périphériques : aucune pierre dans les accès ni sous les maisons.
    for(let i=0;i<45;i++) {
      const a=range(0,TAU),r=range(.73,.96),q=point(r,a),size=range(.22,.62);
      if(q[2]>-10 || landings.some(p=>Math.hypot(q[0]-p.x,q[2]-p.z)<p.r+size+.5))continue;
      if(paths.some(path=>path.slice(1).some((b,k)=>nearestSegment(q[0],q[2],path[k],b).d<1.2+size)))continue;
      rock(q[0],q[1]-.15,q[2],size,size*range(.8,1.8),size*.8);
    }
    for(const p of landings) {
      platforms.push(p);
      // Tailler aussi les socles, sans laisser un disque horizontal recouvrir
      // les dernières marches. La carte de hauteur utilise toujours le palier.
      const top=(r,a)=>{
        const x=p.x+r*Math.cos(a),z=p.z+r*Math.sin(a);let y=p.y;
        for(const path of paths)for(let k=1;k<path.length;k++){
          const q=nearestSegment(x,z,path[k-1],path[k]);
          if(q.d<.85)y=Math.min(y,q.y-.06);
        }
        return [x,y,z];
      };
      for(let ring=0;ring<12;ring++)for(let i=0;i<48;i++){
        const a=i/48*TAU,b=(i+1)/48*TAU,r0=p.r*ring/12,r1=p.r*(ring+1)/12;
        if(ring===0)tri(top(0,0),top(r1,b),top(r1,a),palette.rockLight);
        else quad(top(r0,a),top(r0,b),top(r1,b),top(r1,a),palette.rockLight);
        if(ring===11){const u=top(r1,a),v=top(r1,b);
          quad(u,v,[v[0],p.y-3.6,v[2]],[u[0],p.y-3.6,u[2]],palette.rock);}
      }
    }
    for(const path of paths)stairs(path,1.3,false,true);
    // Une courte liaison de plain-pied laisse la porte et le gardien accessibles.
    stairs([[34,12.5,-23],[33.2,12.5,-23.2]],1.1,false,false);
    house(40,3.6,-12.8,2.5,2.1,2.25,-.05,false,false);
    house(29.7,7,-16,2.4,2.1,2.15,.03,false,false);
    house(39.8,10.3,-20.5,2.6,2.2,2.25,.03,false,false);

    // Phare effilé : emprise déclarée, galerie ouverte, cage à huit montants.
    const lx=34,lz=-25.3,base=12.5,top=18.7;
    terraces.push({x:lx,y:base,z:lz,w:2.1,d:2.1,rot:0,round:true});
    houseLots.push([lx,lz,1.65]);
    cylinder([lx,base,lz],[lx,top,lz],1.05,.80,palette.cream,28);
    for(const y of[base+.12,base+2.05,base+4.2,top-.2])
      cylinder([lx,y,lz],[lx,y+.15,lz],y>18?.9:1.025,y>18?.9:1.025,palette.rockLight,28);
    archDoor([lx,base,lz+1.065],.66,1.5,0);
    for(const y of[base+2.6,base+4.8])windowAt([lx,y,lz+.94],.34,.68,0,false);
    cylinder([lx,top-.15,lz],[lx,top,lz],1.6,1.6,palette.rockLight,32);
    for(let i=0;i<24;i++) {
      const a=i/24*TAU,b=(i+1)/24*TAU;
      const p=[lx+Math.cos(a)*1.48,top,lz+Math.sin(a)*1.48];
      beam(p,add(p,[0,.8,0]),.027,palette.dark);
      beam(add(p,[0,.8,0]),[lx+Math.cos(b)*1.48,top+.8,lz+Math.sin(b)*1.48],.024,palette.dark);
    }
    for(let i=0;i<8;i++) {
      const a=i/8*TAU;
      beam([lx+Math.cos(a)*.76,top,lz+Math.sin(a)*.76],
        [lx+Math.cos(a)*.76,top+1.55,lz+Math.sin(a)*.76],.045,palette.dark);
    }
    // Lentille ambre de secours ; le cœur dynamique mode 7 l'enveloppe une fois branché.
    cylinder([lx,19.08,lz],[lx,19.82,lz],.25,.25,color(0xdeab55),16);
    cylinder([lx,20.25,lz],[lx,20.38,lz],1.03,1.03,palette.trim,24);
    cylinder([lx,20.38,lz],[lx,21.10,lz],1.03,.06,palette.tile,24);
    beam([lx,21.1,lz],[lx,21.65,lz],.03,palette.dark);

  } finally {
    seed = pharePreviousSeed;
  }
}
