import React from 'react';
import {SC01_GroupRight} from '../scenes/SC01_GroupRight';
import {SC02_ScaleStory} from '../scenes/SC02_ScaleStory';
import {sceneAR, sceneFramesAR, sceneReadyAR} from '../timing/beats-ar';

/**
 * V2 Arabic scene registry.
 *
 * Educational metadata is transcribed from the Full Script (the visual-direction
 * authority) so each scene carries its term, purpose, memory hook and the
 * misconception it exists to kill — the direction travels with the code.
 */
export type SceneMetaAR = {
  scene: number;
  id: string;
  titleAr: string;
  terms: string[];
  purpose: string;
  memoryHook: string;
  misconception: string;
  component?: React.FC;
};

export const SCENES_AR: SceneMetaAR[] = [
  {scene: 1, id: 'sc01-group-right', titleAr: 'قروب الجسم: يمين مين؟', terms: ['Right', 'Left'],
   purpose: 'الحاجة لمرجع موحد؛ أوامر القروب غير الدقيقة لا تحدد patient right.',
   memoryHook: 'سالم أنشأ قروبًا لتنظيم الجسم، لكن أول أمر لا يحدد منظور اليمين.',
   misconception: 'يمين الشاشة ليس يمين صاحب الجسم.', component: SC01_GroupRight},
  {scene: 2, component: SC02_ScaleStory, id: 'sc02-scale', titleAr: 'القروب طلع أكبر مما توقعنا', terms: ['Gross anatomy', 'Macroscopic anatomy', 'Histology', 'Cytology', 'Microscopic anatomy'],
   purpose: 'تعريف العلم الحديث ومعنى Histology/Cytology عبر تغيّر مستوى النظر.',
   memoryHook: 'كل ما قرّبت الصورة، دخل أعضاء جدد في القروب.',
   misconception: 'الـAnatomy ليست بالضرورة قطعًا فعليًا.'},
  {scene: 3, id: 'sc03-position', titleAr: 'ثبّت الوقفة… قبل ما تعطي أوامر', terms: ['Anatomical position'],
   purpose: 'الوقفة المرجعية ثابتة حتى لو تغيّرت وضعية المريض.',
   memoryHook: 'سالم هو من يلاحظ أن الكفوف غلط.',
   misconception: 'المرجع يتغيّر لو انسدح المريض.'},
  {scene: 4, id: 'sc04-sagittal', titleAr: 'جدار بالنص… لكنه مو صاحب البيت', terms: ['Plane', 'Section', 'Sagittal', 'Midsagittal'],
   purpose: 'الفصل بين اتجاه الـplane وموقعه، وبين plane وsection.',
   memoryHook: 'سالم يسأل عن اسم الجدار بعد إزاحته.',
   misconception: 'كل Sagittal ليس Midsagittal؛ ونصفا الجسم لا يعنيان تطابق الأعضاء.'},
  {scene: 5, id: 'sc05-coronal-transverse', titleAr: 'لا تقول كل جدار نفس الجدار', terms: ['Coronal', 'Frontal', 'Transverse', 'Horizontal', 'Axial'],
   purpose: 'التمييز بين المستويات بما تقسمه لا بكونها رأسية/أفقية.',
   memoryHook: 'ثلاث تسميات لنفس المستوى.',
   misconception: 'عمودي = نفس المستوى.'},
  {scene: 6, id: 'sc06-directions', titleAr: 'فوق… فوق وش؟', terms: ['Anterior', 'Posterior', 'Ventral', 'Dorsal', 'Superior', 'Inferior'],
   purpose: 'الاتجاهات علاقات بين تركيبين، لا مواضع مطلقة.',
   memoryHook: '«اللي فوق ينزل شوي» — فوق بالنسبة لوش؟',
   misconception: 'Superior = أعلى الشاشة.'},
  {scene: 7, id: 'sc07-midline', titleAr: 'الـmidline مثبت بالقروب', terms: ['Medial', 'Lateral'],
   purpose: 'الـmidline مرجع ثابت لا يُسحب لضبط الإجابة.',
   memoryHook: 'سالم يحاول تحريك الخط؛ الخط ما يتحرك.',
   misconception: 'تحريك المرجع يغيّر التسمية.'},
  {scene: 8, id: 'sc08-proximal', titleAr: 'اليد رجعت البيت… بس ما تغير ترتيبها', terms: ['Proximal', 'Distal'],
   purpose: 'الترتيب التشريحي على الطرف، لا أقصر مسافة على الشاشة.',
   memoryHook: 'ثنى ذراعه فصارت اليد قريبة من الصدر — والترتيب ما تغيّر.',
   misconception: 'القرب على الشاشة يحدد Proximal.'},
  {scene: 9, id: 'sc09-depth', titleAr: 'الـbrain مأخذ آخر غرفة', terms: ['Superficial', 'Deep'],
   purpose: 'العمق وصف للمكان لا لحجم الشيء أو خطورته.',
   memoryHook: 'الـbrain في آخر غرفة.',
   misconception: 'Deep = مهم أو خطير.'},
  {scene: 10, id: 'sc10-flexion', titleAr: 'المرفق يقفل على الزاوية', terms: ['Flexion', 'Extension'],
   purpose: 'الزاوية بين العظام هي الحكم، لا اتجاه الشاشة.',
   memoryHook: 'الركبة تكسر قاعدة «Flexion دائمًا قدام».',
   misconception: 'قدام = Flexion.'},
  {scene: 11, id: 'sc11-abduction', titleAr: 'الذراع دخل جو فراق — اللقطة الغنائية', terms: ['Abduction', 'Adduction', 'Shoulder flexion'],
   purpose: 'الابتعاد/الاقتراب عن الـmidline عند الـshoulder.',
   memoryHook: 'جو الفراق: بينهم مسافة.',
   misconception: 'رفع الذراع للأمام ليس Abduction تلقائيًا.'},
  {scene: 12, id: 'sc12-circumduction', titleAr: 'رجع… بس لف على كل الحركات', terms: ['Circumduction'],
   purpose: 'تتابع مستمر: Flexion → Abduction → Extension → Adduction.',
   memoryHook: 'طرف الذراع يرسم الدائرة.',
   misconception: 'Circumduction = دوران حول المحور.'},
  {scene: 13, id: 'sc13-rotation', titleAr: 'ثابت مكانه… ويلف حول نفسه', terms: ['Medial rotation', 'Lateral rotation'],
   purpose: 'الدوران حول المحور الطولي، لا موضع اليد النهائي.',
   memoryHook: 'ثابت مكانه ويلف حول نفسه.',
   misconception: 'كل دخول لليد = Medial rotation.'},
  {scene: 14, id: 'sc14-pronation', titleAr: 'اقلب الكف… لا تقلب الجسم كله', terms: ['Pronation', 'Supination'],
   purpose: 'radius يعبر ulna في Pronation ويعودان للتوازي في Supination.',
   memoryHook: 'اقلب الكف لا الجسم.',
   misconception: 'لفّة رسغ فقط.'},
  {scene: 15, id: 'sc15-jaw', titleAr: 'الفك متقدم… والفم ساكت', terms: ['Protraction', 'Retraction'],
   purpose: 'تقدّم/تراجع الفك، لا فتح/إغلاق.',
   memoryHook: 'الفك يتقدم والفم ساكت.',
   misconception: 'Protraction = فتح الفم.'},
  {scene: 16, id: 'sc16-ankle', titleAr: 'القدم تفهم العلاقة… مو اتجاه الشاشة', terms: ['Dorsiflexion', 'Plantar flexion'],
   purpose: 'الحركة عند الـankle بالنسبة للساق.',
   memoryHook: 'الـdorsum يقرب من الساق.',
   misconception: 'اتجاه الشاشة يحدد الاسم.'},
  {scene: 17, id: 'sc17-sole', titleAr: 'الـsole هو اللي يفضح الاسم', terms: ['Inversion', 'Eversion'],
   purpose: 'الباطن نحو/بعيد عن الـmidline — الـsole هو المرجع البصري.',
   memoryHook: 'الـsole يفضح الاسم.',
   misconception: 'ميل الرجل كلها = Inversion/Eversion.'},
  {scene: 18, id: 'sc18-shoulder', titleAr: 'الكتف يرد بدل سالم', terms: ['Elevation', 'Depression', 'Protraction', 'Retraction'],
   purpose: 'حركات الكتف الأربع.',
   memoryHook: 'الكتف يرد بدل سالم.',
   misconception: 'خلط Elevation مع Protraction.'},
  {scene: 19, id: 'sc19-clinical', titleAr: 'طلعت من القروب… دخلت الملعب', terms: ['Eversion'],
   purpose: 'حالة سريرية: توجيه الباطن للخارج بعيدًا عن الـmidline.',
   memoryHook: 'لاعب كرة، كاحل يمين.',
   misconception: 'الحركة وحدها لا تثبت سلامة الـlateral ligaments.'},
  {scene: 20, id: 'sc20-callback', titleAr: 'آخر رسالة بالقروب… واضحة أخيرًا', terms: ['Patient right', 'Elbow', 'Extension', 'Abduction', 'Adduction'],
   purpose: 'العودة للمشهد 01 — أمر دقيق يحدد الطرف والمفصل والاتجاه.',
   memoryHook: 'نفس الأمر الأول، لكنه صار واضحًا.',
   misconception: '«هنا» ليست وصفًا.'},
  {scene: 21, id: 'sc21-retrieval', titleAr: 'اختبار المدير قبل ما يقفل القروب', terms: ['retrieval'],
   purpose: 'استرجاع نهائي لكل المصطلحات.',
   memoryHook: 'المدير يختبر القروب قبل الإقفال.',
   misconception: '—'},
];

export const sceneMetaAR = (n: number) => {
  const m = SCENES_AR.find((s) => s.scene === n);
  if (!m) throw new Error(`No V2 scene meta for ${n}`);
  return m;
};

/** Scenes that have BOTH final audio and an implemented component. */
export const renderableScenesAR = () =>
  SCENES_AR.filter((s) => s.component !== undefined && sceneReadyAR(s.scene));

export const sceneStatusAR = () =>
  SCENES_AR.map((s) => ({
    scene: s.scene,
    id: s.id,
    implemented: s.component !== undefined,
    audioReady: sceneReadyAR(s.scene),
    linesFinal: sceneAR(s.scene).linesFinal,
    linesTotal: sceneAR(s.scene).linesTotal,
    frames: sceneFramesAR(s.scene),
  }));
