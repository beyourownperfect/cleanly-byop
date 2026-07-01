import { db } from './dexie';
import { generateId } from '../lib/id';

const SEED_VERSION = 2;

export async function seedData(): Promise<void> {
  const ver = Number(localStorage.getItem('homeos_seed_version'));
  if (ver === SEED_VERSION && (await db.lifecycles.count()) > 0) return;

  // Bump → clear old data so fresh seed takes effect
  await db.delete();
  await db.open();
  localStorage.setItem('homeos_seed_version', String(SEED_VERSION));

  const now = new Date().toISOString();

  // ─── Registry: all entity IDs by key name ─────────────────────
  const id = {
    zone: {
      room: generateId(), bathroom: generateId(), kitchen: generateId(),
      hall: generateId(), balcony: generateId(), office: generateId(),
      outsideHome: generateId(), travel: generateId(),
    },
    space: {
      studyDesk: generateId(), bed: generateId(), underBed: generateId(),
      floor: generateId(), windowHandle: generateId(), windowShelf: generateId(),
      wallShelf: generateId(), chair: generateId(), whiteboardStand: generateId(),
      guitarStand: generateId(), laptopMount: generateId(), monitorArm: generateId(),
      keyboardArea: generateId(), underDesk: generateId(), extensionBoard: generateId(),
      laundryBag: generateId(), bigBluePlasticBag: generateId(), redSuitcase: generateId(),
      whiteBox: generateId(), topShelf: generateId(), bottomSideLaundryBag: generateId(),
      bathroomShelf: generateId(), sinkArea: generateId(), commodeArea: generateId(),
      cleaningArea: generateId(),
      dryingArea: generateId(), hangingLine: generateId(),
      kitchenShelf: generateId(), pantryShelf: generateId(),
      officeDesk: generateId(), officeBag: generateId(), officeStorageSpot: generateId(),
      travelBag: generateId(), packedBag: generateId(),
      outsideHomeSpace: generateId(), officeCommuteBag: generateId(),
    },
    lc: {
      laundry: generateId(), footwear: generateId(), dailyCarry: generateId(),
      workSetup: generateId(), deskReset: generateId(), bathroomCare: generateId(),
      roomCleaning: generateId(), whiteboard: generateId(), guitar: generateId(),
      books: generateId(),
    },
    moment: {
      hanging: generateId(), beingWorn: generateId(), laundryBag: generateId(),
      washing: generateId(), drying: generateId(), ironing: generateId(),
      folded: generateId(), backToHanger: generateId(),
      shoesStored: generateId(), wearing: generateId(), dirty: generateId(),
      shoesCleaning: generateId(), shoesDrying: generateId(),
      carryHome: generateId(), packed: generateId(), takenOut: generateId(),
      returned: generateId(), unpacked: generateId(),
      mountedStored: generateId(), inUse: generateId(), closed: generateId(),
      cleaned: generateId(), returnedToMount: generateId(),
      clear: generateId(), inUseDesk: generateId(), cluttered: generateId(),
      reset: generateId(),
      bathStored: generateId(), inUseBath: generateId(), emptyLow: generateId(),
      refillNeeded: generateId(),
      cleanState: generateId(), startingClutter: generateId(), clutteredState: generateId(),
      resetState: generateId(),
      wbStored: generateId(), wbInUse: generateId(), wbNeedsClean: generateId(),
      wbClean: generateId(),
      guitarOnStand: generateId(), playing: generateId(), returnedToStand: generateId(),
      bookStored: generateId(), readingWriting: generateId(), onDesk: generateId(),
      bookReturned: generateId(),
    },
  } as const;

  const { zone, space, lc, moment } = id;

  // ─── ZONES ──────────────────────────────────────────────────────
  await db.zones.bulkAdd([
    { id: zone.room, name: 'Room', icon: '🛏️', sortOrder: 0, createdAt: now, updatedAt: now },
    { id: zone.bathroom, name: 'Attached Bathroom', icon: '🚿', sortOrder: 1, createdAt: now, updatedAt: now },
    { id: zone.kitchen, name: 'Kitchen', icon: '🍳', sortOrder: 2, createdAt: now, updatedAt: now },
    { id: zone.hall, name: 'Hall', icon: '🚪', sortOrder: 3, createdAt: now, updatedAt: now },
    { id: zone.balcony, name: 'Balcony', icon: '🌿', sortOrder: 4, createdAt: now, updatedAt: now },
    { id: zone.office, name: 'Office', icon: '💼', sortOrder: 5, createdAt: now, updatedAt: now },
    { id: zone.outsideHome, name: 'Outside Home', icon: '🌍', sortOrder: 6, createdAt: now, updatedAt: now },
    { id: zone.travel, name: 'Travel', icon: '🧳', sortOrder: 7, createdAt: now, updatedAt: now },
  ]);

  // ─── STORAGE SPACES ─────────────────────────────────────────────
  await db.storageSpaces.bulkAdd([
    // Room
    { id: space.studyDesk, name: 'Study Desk', zoneId: zone.room, parentId: null, icon: '🪑', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.bed, name: 'Bed', zoneId: zone.room, parentId: null, icon: '🛏️', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.underBed, name: 'Under Bed', zoneId: zone.room, parentId: null, icon: '📦', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.floor, name: 'Floor', zoneId: zone.room, parentId: null, icon: '🏠', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.windowHandle, name: 'Window Handle', zoneId: zone.room, parentId: null, icon: '🪟', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.windowShelf, name: 'Window Shelf', zoneId: zone.room, parentId: null, icon: '🪟', sortOrder: 5, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.wallShelf, name: 'Wall Shelf', zoneId: zone.room, parentId: null, icon: '📚', sortOrder: 6, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.chair, name: 'Chair', zoneId: zone.room, parentId: null, icon: '🪑', sortOrder: 7, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.whiteboardStand, name: 'Whiteboard Stand Position', zoneId: zone.room, parentId: null, icon: '📋', sortOrder: 8, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.guitarStand, name: 'Guitar Stand', zoneId: zone.room, parentId: null, icon: '🎸', sortOrder: 9, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.laptopMount, name: 'Laptop Mount', zoneId: zone.room, parentId: null, icon: '💻', sortOrder: 10, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.monitorArm, name: 'Monitor Arm', zoneId: zone.room, parentId: null, icon: '🖥️', sortOrder: 11, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.keyboardArea, name: 'Keyboard Area', zoneId: zone.room, parentId: null, icon: '⌨️', sortOrder: 12, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.underDesk, name: 'Under Desk', zoneId: zone.room, parentId: null, icon: '🪑', sortOrder: 13, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.extensionBoard, name: 'Extension Board Area', zoneId: zone.room, parentId: null, icon: '🔌', sortOrder: 14, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.laundryBag, name: 'Laundry Bag', zoneId: zone.room, parentId: null, icon: '🧺', sortOrder: 15, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.bigBluePlasticBag, name: 'Big Blue Plastic Bag', zoneId: zone.room, parentId: null, icon: '🛍️', sortOrder: 16, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.redSuitcase, name: 'Red Suitcase', zoneId: zone.room, parentId: null, icon: '🧳', sortOrder: 17, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.whiteBox, name: 'White Box', zoneId: zone.room, parentId: null, icon: '📦', sortOrder: 18, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.topShelf, name: 'Top Shelf', zoneId: zone.room, parentId: null, icon: '📚', sortOrder: 19, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.bottomSideLaundryBag, name: 'Bottom Side of Laundry Bag', zoneId: zone.room, parentId: null, icon: '🧺', sortOrder: 20, isArchived: false, createdAt: now, updatedAt: now },
    // Bathroom
    { id: space.bathroomShelf, name: 'Bathroom Shelf', zoneId: zone.bathroom, parentId: null, icon: '🧴', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.sinkArea, name: 'Sink Area', zoneId: zone.bathroom, parentId: null, icon: '🚰', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.commodeArea, name: 'Commode Area', zoneId: zone.bathroom, parentId: null, icon: '🚽', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.cleaningArea, name: 'Cleaning Area', zoneId: zone.bathroom, parentId: null, icon: '🧹', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
    // Balcony
    { id: space.dryingArea, name: 'Drying Area', zoneId: zone.balcony, parentId: null, icon: '☀️', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.hangingLine, name: 'Hanging Line / Drying Spot', zoneId: zone.balcony, parentId: null, icon: '🧺', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    // Kitchen
    { id: space.kitchenShelf, name: 'Kitchen Shelf', zoneId: zone.kitchen, parentId: null, icon: '🥫', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.pantryShelf, name: 'Pantry Shelf', zoneId: zone.kitchen, parentId: null, icon: '🍽️', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    // Office
    { id: space.officeDesk, name: 'Office Desk', zoneId: zone.office, parentId: null, icon: '🪑', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.officeBag, name: 'Office Bag', zoneId: zone.office, parentId: null, icon: '💼', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.officeStorageSpot, name: 'Office Storage Spot', zoneId: zone.office, parentId: null, icon: '📦', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
    // Travel / Outside
    { id: space.travelBag, name: 'Travel Bag', zoneId: zone.travel, parentId: null, icon: '🧳', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.packedBag, name: 'Packed Bag', zoneId: zone.travel, parentId: null, icon: '🎒', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.outsideHomeSpace, name: 'Outside Home', zoneId: zone.outsideHome, parentId: null, icon: '🌍', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
    { id: space.officeCommuteBag, name: 'Office Commute Bag', zoneId: zone.outsideHome, parentId: null, icon: '💼', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  ]);

  // ─── LIFECYCLES ────────────────────────────────────────────────
  await db.lifecycles.bulkAdd([
    { id: lc.laundry, name: 'Laundry', description: 'Clothes through wash and fold cycles', icon: '👕', createdAt: now, updatedAt: now },
    { id: lc.footwear, name: 'Footwear', description: 'Shoes, slippers, and footwear care', icon: '👟', createdAt: now, updatedAt: now },
    { id: lc.dailyCarry, name: 'Daily Carry', description: 'Items carried out and brought back', icon: '🎒', createdAt: now, updatedAt: now },
    { id: lc.workSetup, name: 'Laptop / Work Setup', description: 'Laptop mounting, use, and cleaning', icon: '💻', createdAt: now, updatedAt: now },
    { id: lc.deskReset, name: 'Desk Reset', description: 'Desk surface — clear, cluttered, reset', icon: '🪑', createdAt: now, updatedAt: now },
    { id: lc.bathroomCare, name: 'Bathroom / Personal Care', description: 'Toiletries, bathroom items lifecycle', icon: '🧴', createdAt: now, updatedAt: now },
    { id: lc.roomCleaning, name: 'Room Cleaning', description: 'Floor, bed, under-bed cleaning cycle', icon: '🧹', createdAt: now, updatedAt: now },
    { id: lc.whiteboard, name: 'Whiteboard', description: 'Whiteboard use, cleaning, and storage', icon: '📋', createdAt: now, updatedAt: now },
    { id: lc.guitar, name: 'Guitar', description: 'Guitar playing and maintenance', icon: '🎸', createdAt: now, updatedAt: now },
    { id: lc.books, name: 'Books / Journal', description: 'Books, notebooks, journals', icon: '📖', createdAt: now, updatedAt: now },
  ]);

  // ─── MOMENTS + TRANSITIONS ─────────────────────────────────────
  type MomDef = { id: string; lifecycleId: string; name: string; icon: string; weight: number; order: number };
  type TransDef = { fromId: string; toId: string; label: string; order: number };

  function addMoments(lifecycleId: string, defs: MomDef[]): void {
    db.moments.bulkAdd(defs.map(m => ({
      id: m.id, lifecycleId: m.lifecycleId, name: m.name, icon: m.icon,
      atmosphereWeight: m.weight, sortOrder: m.order,
      createdAt: now, updatedAt: now,
    })));
  }

  function addTransitions(defs: TransDef[]): void {
    db.transitions.bulkAdd(defs.map(d => ({
      id: generateId(), lifecycleId: d.fromId, // lifecycleId is set per-call below
      fromMomentId: d.fromId, toMomentId: d.toId,
      label: d.label, sortOrder: d.order, createdAt: now,
    })));
  }

  // Helper to build transitions with the correct lifecycleId
  function transitions(lcId: string, defs: { from: string; to: string; label: string }[]) {
    return defs.map((d, i) => ({
      id: generateId(), lifecycleId: lcId, fromMomentId: d.from, toMomentId: d.to,
      label: d.label, sortOrder: i, createdAt: now,
    }));
  }

  // ── 1. Laundry ────────────────────────────────────────
  addMoments(lc.laundry, [
    { id: moment.hanging, lifecycleId: lc.laundry, name: 'Hanging in Closet', icon: '👔', weight: 0.8, order: 0 },
    { id: moment.beingWorn, lifecycleId: lc.laundry, name: 'Being Worn', icon: '🚶', weight: 0, order: 1 },
    { id: moment.laundryBag, lifecycleId: lc.laundry, name: 'Laundry Bag', icon: '🧺', weight: -0.3, order: 2 },
    { id: moment.washing, lifecycleId: lc.laundry, name: 'Washing', icon: '🫧', weight: -0.2, order: 3 },
    { id: moment.drying, lifecycleId: lc.laundry, name: 'Drying', icon: '☀️', weight: 0.2, order: 4 },
    { id: moment.ironing, lifecycleId: lc.laundry, name: 'Ironing', icon: '💨', weight: 0.1, order: 5 },
    { id: moment.folded, lifecycleId: lc.laundry, name: 'Folded', icon: '✅', weight: 0.4, order: 6 },
    { id: moment.backToHanger, lifecycleId: lc.laundry, name: 'Back to Hanger / Shelf', icon: '👔', weight: 0.9, order: 7 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.laundry, [
    { from: moment.hanging, to: moment.beingWorn, label: 'Wearing' },
    { from: moment.beingWorn, to: moment.laundryBag, label: 'To Wash' },
    { from: moment.laundryBag, to: moment.washing, label: 'Start Wash' },
    { from: moment.washing, to: moment.drying, label: 'To Dry' },
    { from: moment.drying, to: moment.ironing, label: 'Iron' },
    { from: moment.ironing, to: moment.folded, label: 'Fold' },
    { from: moment.folded, to: moment.backToHanger, label: 'Put Away' },
  ]));

  // ── 2. Footwear ────────────────────────────────────────
  addMoments(lc.footwear, [
    { id: moment.shoesStored, lifecycleId: lc.footwear, name: 'Stored', icon: '📦', weight: 0.8, order: 0 },
    { id: moment.wearing, lifecycleId: lc.footwear, name: 'Wearing', icon: '👟', weight: 0, order: 1 },
    { id: moment.dirty, lifecycleId: lc.footwear, name: 'Dirty', icon: '💩', weight: -0.3, order: 2 },
    { id: moment.shoesCleaning, lifecycleId: lc.footwear, name: 'Cleaning', icon: '🧽', weight: -0.2, order: 3 },
    { id: moment.shoesDrying, lifecycleId: lc.footwear, name: 'Drying', icon: '☀️', weight: 0.2, order: 4 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.footwear, [
    { from: moment.shoesStored, to: moment.wearing, label: 'Wear' },
    { from: moment.wearing, to: moment.dirty, label: 'Get Dirty' },
    { from: moment.dirty, to: moment.shoesCleaning, label: 'Clean' },
    { from: moment.shoesCleaning, to: moment.shoesDrying, label: 'Dry' },
    { from: moment.shoesDrying, to: moment.shoesStored, label: 'Put Away' },
  ]));

  // ── 3. Daily Carry ─────────────────────────────────────
  addMoments(lc.dailyCarry, [
    { id: moment.carryHome, lifecycleId: lc.dailyCarry, name: 'Home', icon: '🏠', weight: 0.8, order: 0 },
    { id: moment.packed, lifecycleId: lc.dailyCarry, name: 'Packed', icon: '🎒', weight: -0.1, order: 1 },
    { id: moment.takenOut, lifecycleId: lc.dailyCarry, name: 'Taken Out', icon: '🚶', weight: -0.2, order: 2 },
    { id: moment.returned, lifecycleId: lc.dailyCarry, name: 'Returned', icon: '🔄', weight: 0.3, order: 3 },
    { id: moment.unpacked, lifecycleId: lc.dailyCarry, name: 'Unpacked', icon: '✅', weight: 0.7, order: 4 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.dailyCarry, [
    { from: moment.carryHome, to: moment.packed, label: 'Pack' },
    { from: moment.packed, to: moment.takenOut, label: 'Take Out' },
    { from: moment.takenOut, to: moment.returned, label: 'Return' },
    { from: moment.returned, to: moment.unpacked, label: 'Unpack' },
  ]));

  // ── 4. Laptop / Work Setup ────────────────────────────
  addMoments(lc.workSetup, [
    { id: moment.mountedStored, lifecycleId: lc.workSetup, name: 'Mounted / Stored', icon: '💻', weight: 0.8, order: 0 },
    { id: moment.inUse, lifecycleId: lc.workSetup, name: 'In Use', icon: '⚡', weight: 0, order: 1 },
    { id: moment.closed, lifecycleId: lc.workSetup, name: 'Closed', icon: '🔒', weight: 0.3, order: 2 },
    { id: moment.cleaned, lifecycleId: lc.workSetup, name: 'Cleaned', icon: '🧹', weight: 0.6, order: 3 },
    { id: moment.returnedToMount, lifecycleId: lc.workSetup, name: 'Returned to Mount', icon: '💻', weight: 0.9, order: 4 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.workSetup, [
    { from: moment.mountedStored, to: moment.inUse, label: 'Set Up' },
    { from: moment.inUse, to: moment.closed, label: 'Close' },
    { from: moment.closed, to: moment.cleaned, label: 'Clean' },
    { from: moment.cleaned, to: moment.returnedToMount, label: 'Return to Mount' },
  ]));

  // ── 5. Desk Reset ──────────────────────────────────────
  addMoments(lc.deskReset, [
    { id: moment.clear, lifecycleId: lc.deskReset, name: 'Clear', icon: '✅', weight: 0.9, order: 0 },
    { id: moment.inUseDesk, lifecycleId: lc.deskReset, name: 'In Use', icon: '📝', weight: 0, order: 1 },
    { id: moment.cluttered, lifecycleId: lc.deskReset, name: 'Cluttered', icon: '📦', weight: -0.4, order: 2 },
    { id: moment.reset, lifecycleId: lc.deskReset, name: 'Reset', icon: '🔄', weight: 0.5, order: 3 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.deskReset, [
    { from: moment.clear, to: moment.inUseDesk, label: 'Start Using' },
    { from: moment.inUseDesk, to: moment.cluttered, label: 'Gets Cluttered' },
    { from: moment.cluttered, to: moment.reset, label: 'Reset' },
    { from: moment.reset, to: moment.clear, label: 'Clear' },
  ]));

  // ── 6. Bathroom / Personal Care ────────────────────────
  addMoments(lc.bathroomCare, [
    { id: moment.bathStored, lifecycleId: lc.bathroomCare, name: 'Stored', icon: '🧴', weight: 0.8, order: 0 },
    { id: moment.inUseBath, lifecycleId: lc.bathroomCare, name: 'In Use', icon: '🚿', weight: 0, order: 1 },
    { id: moment.emptyLow, lifecycleId: lc.bathroomCare, name: 'Empty / Low', icon: '⚠️', weight: -0.3, order: 2 },
    { id: moment.refillNeeded, lifecycleId: lc.bathroomCare, name: 'Refill Needed', icon: '🔄', weight: -0.2, order: 3 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.bathroomCare, [
    { from: moment.bathStored, to: moment.inUseBath, label: 'Use' },
    { from: moment.inUseBath, to: moment.emptyLow, label: 'Finish' },
    { from: moment.emptyLow, to: moment.refillNeeded, label: 'Refill' },
    { from: moment.refillNeeded, to: moment.bathStored, label: 'Put Away' },
  ]));

  // ── 7. Room Cleaning ───────────────────────────────────
  addMoments(lc.roomCleaning, [
    { id: moment.cleanState, lifecycleId: lc.roomCleaning, name: 'Clean', icon: '✨', weight: 0.9, order: 0 },
    { id: moment.startingClutter, lifecycleId: lc.roomCleaning, name: 'Starting to Clutter', icon: '📦', weight: 0.2, order: 1 },
    { id: moment.clutteredState, lifecycleId: lc.roomCleaning, name: 'Cluttered', icon: '📦', weight: -0.4, order: 2 },
    { id: moment.resetState, lifecycleId: lc.roomCleaning, name: 'Reset', icon: '🔄', weight: 0.5, order: 3 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.roomCleaning, [
    { from: moment.cleanState, to: moment.startingClutter, label: 'Gets Messy' },
    { from: moment.startingClutter, to: moment.clutteredState, label: 'Cluttered' },
    { from: moment.clutteredState, to: moment.resetState, label: 'Reset' },
    { from: moment.resetState, to: moment.cleanState, label: 'Clean' },
  ]));

  // ── 8. Whiteboard ──────────────────────────────────────
  addMoments(lc.whiteboard, [
    { id: moment.wbStored, lifecycleId: lc.whiteboard, name: 'Stored / Against Window', icon: '📋', weight: 0.8, order: 0 },
    { id: moment.wbInUse, lifecycleId: lc.whiteboard, name: 'In Use', icon: '✍️', weight: 0, order: 1 },
    { id: moment.wbNeedsClean, lifecycleId: lc.whiteboard, name: 'Needs Cleaning', icon: '🧽', weight: -0.2, order: 2 },
    { id: moment.wbClean, lifecycleId: lc.whiteboard, name: 'Clean', icon: '✨', weight: 0.7, order: 3 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.whiteboard, [
    { from: moment.wbStored, to: moment.wbInUse, label: 'Use' },
    { from: moment.wbInUse, to: moment.wbNeedsClean, label: 'Needs Clean' },
    { from: moment.wbNeedsClean, to: moment.wbClean, label: 'Clean' },
    { from: moment.wbClean, to: moment.wbStored, label: 'Put Away' },
  ]));

  // ── 9. Guitar ──────────────────────────────────────────
  addMoments(lc.guitar, [
    { id: moment.guitarOnStand, lifecycleId: lc.guitar, name: 'On Stand', icon: '🎸', weight: 0.9, order: 0 },
    { id: moment.playing, lifecycleId: lc.guitar, name: 'Playing', icon: '🎶', weight: 0, order: 1 },
    { id: moment.returnedToStand, lifecycleId: lc.guitar, name: 'Returned to Stand', icon: '🎸', weight: 0.9, order: 2 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.guitar, [
    { from: moment.guitarOnStand, to: moment.playing, label: 'Play' },
    { from: moment.playing, to: moment.returnedToStand, label: 'Return to Stand' },
  ]));

  // ── 10. Books / Journal ────────────────────────────────
  addMoments(lc.books, [
    { id: moment.bookStored, lifecycleId: lc.books, name: 'Stored', icon: '📚', weight: 0.8, order: 0 },
    { id: moment.readingWriting, lifecycleId: lc.books, name: 'Reading / Writing', icon: '📖', weight: 0.2, order: 1 },
    { id: moment.onDesk, lifecycleId: lc.books, name: 'On Desk', icon: '🪑', weight: 0, order: 2 },
    { id: moment.bookReturned, lifecycleId: lc.books, name: 'Returned to Shelf', icon: '📚', weight: 0.8, order: 3 },
  ]);
  await db.transitions.bulkAdd(transitions(lc.books, [
    { from: moment.bookStored, to: moment.readingWriting, label: 'Start Reading' },
    { from: moment.readingWriting, to: moment.onDesk, label: 'On Desk' },
    { from: moment.onDesk, to: moment.bookReturned, label: 'Return to Shelf' },
  ]));

  // ─── OBJECTS ───────────────────────────────────────────────────
  // Each object starts at its home space in a resting moment.
  // The Home screen only shows them once they leave rest (weight < 0.5).

  await db.objects.bulkAdd([
    // Laundry
    { id: generateId(), name: 'Office Shirts', icon: '👔', lifecycleId: lc.laundry, homeStorageSpaceId: space.topShelf, currentMomentId: moment.hanging, currentStorageSpaceId: space.topShelf, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Home T-shirts', icon: '👕', lifecycleId: lc.laundry, homeStorageSpaceId: space.topShelf, currentMomentId: moment.hanging, currentStorageSpaceId: space.topShelf, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Socks', icon: '🧦', lifecycleId: lc.laundry, homeStorageSpaceId: space.topShelf, currentMomentId: moment.hanging, currentStorageSpaceId: space.topShelf, createdAt: now, updatedAt: now },
    // Footwear
    { id: generateId(), name: 'Shoes', icon: '👟', lifecycleId: lc.footwear, homeStorageSpaceId: space.underBed, currentMomentId: moment.shoesStored, currentStorageSpaceId: space.underBed, createdAt: now, updatedAt: now },
    // Daily Carry
    { id: generateId(), name: 'JBL Headphones', icon: '🎧', lifecycleId: lc.dailyCarry, homeStorageSpaceId: space.studyDesk, currentMomentId: moment.carryHome, currentStorageSpaceId: space.studyDesk, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Wireless Mouse', icon: '🖱️', lifecycleId: lc.dailyCarry, homeStorageSpaceId: space.keyboardArea, currentMomentId: moment.carryHome, currentStorageSpaceId: space.keyboardArea, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Mechanical Keyboard', icon: '⌨️', lifecycleId: lc.dailyCarry, homeStorageSpaceId: space.keyboardArea, currentMomentId: moment.carryHome, currentStorageSpaceId: space.keyboardArea, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Office ID Card', icon: '🪪', lifecycleId: lc.dailyCarry, homeStorageSpaceId: space.studyDesk, currentMomentId: moment.carryHome, currentStorageSpaceId: space.studyDesk, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Watch', icon: '⌚', lifecycleId: lc.dailyCarry, homeStorageSpaceId: space.studyDesk, currentMomentId: moment.carryHome, currentStorageSpaceId: space.studyDesk, createdAt: now, updatedAt: now },
    // Laptop / Work Setup
    { id: generateId(), name: 'Personal Laptop', icon: '💻', lifecycleId: lc.workSetup, homeStorageSpaceId: space.laptopMount, currentMomentId: moment.mountedStored, currentStorageSpaceId: space.laptopMount, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Office Laptop', icon: '💼', lifecycleId: lc.workSetup, homeStorageSpaceId: space.officeBag, currentMomentId: moment.mountedStored, currentStorageSpaceId: space.officeBag, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Pen Tablet', icon: '✏️', lifecycleId: lc.workSetup, homeStorageSpaceId: space.studyDesk, currentMomentId: moment.mountedStored, currentStorageSpaceId: space.studyDesk, createdAt: now, updatedAt: now },
    // Desk Reset (meta-object for surface state)
    { id: generateId(), name: 'Study Desk', icon: '🪑', lifecycleId: lc.deskReset, homeStorageSpaceId: space.studyDesk, currentMomentId: moment.cluttered, currentStorageSpaceId: space.studyDesk, createdAt: now, updatedAt: now },
    // Whiteboard
    { id: generateId(), name: 'Whiteboard', icon: '📋', lifecycleId: lc.whiteboard, homeStorageSpaceId: space.whiteboardStand, currentMomentId: moment.wbStored, currentStorageSpaceId: space.whiteboardStand, createdAt: now, updatedAt: now },
    // Guitar
    { id: generateId(), name: 'Guitar', icon: '🎸', lifecycleId: lc.guitar, homeStorageSpaceId: space.guitarStand, currentMomentId: moment.guitarOnStand, currentStorageSpaceId: space.guitarStand, createdAt: now, updatedAt: now },
    // Books / Journal
    { id: generateId(), name: 'Journal', icon: '📓', lifecycleId: lc.books, homeStorageSpaceId: space.wallShelf, currentMomentId: moment.bookStored, currentStorageSpaceId: space.wallShelf, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'GATE Notebooks', icon: '📚', lifecycleId: lc.books, homeStorageSpaceId: space.wallShelf, currentMomentId: moment.bookStored, currentStorageSpaceId: space.wallShelf, createdAt: now, updatedAt: now },
    // Bathroom / Personal Care
    { id: generateId(), name: 'Shampoo', icon: '🧴', lifecycleId: lc.bathroomCare, homeStorageSpaceId: space.bathroomShelf, currentMomentId: moment.bathStored, currentStorageSpaceId: space.bathroomShelf, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Whey Protein', icon: '💪', lifecycleId: lc.bathroomCare, homeStorageSpaceId: space.topShelf, currentMomentId: moment.bathStored, currentStorageSpaceId: space.topShelf, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Dumbbells', icon: '🏋️', lifecycleId: lc.bathroomCare, homeStorageSpaceId: space.underDesk, currentMomentId: moment.bathStored, currentStorageSpaceId: space.underDesk, createdAt: now, updatedAt: now },
    // Room Cleaning (meta-object for room state)
    { id: generateId(), name: 'Room', icon: '🛏️', lifecycleId: lc.roomCleaning, homeStorageSpaceId: space.floor, currentMomentId: moment.clutteredState, currentStorageSpaceId: space.floor, createdAt: now, updatedAt: now },
    // Laundry (for Laundry routine)
    { id: generateId(), name: 'Laundry Load', icon: '🧺', lifecycleId: lc.laundry, homeStorageSpaceId: space.laundryBag, currentMomentId: moment.laundryBag, currentStorageSpaceId: space.laundryBag, createdAt: now, updatedAt: now },
    // Archive items (reuse Books lifecycle as simple storage)
    { id: generateId(), name: 'Old Electronics', icon: '🔌', lifecycleId: lc.books, homeStorageSpaceId: space.whiteBox, currentMomentId: moment.bookStored, currentStorageSpaceId: space.whiteBox, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Empty Boxes', icon: '📦', lifecycleId: lc.books, homeStorageSpaceId: space.underBed, currentMomentId: moment.bookStored, currentStorageSpaceId: space.underBed, createdAt: now, updatedAt: now },
  ]);

  // ─── ROUTINES ──────────────────────────────────────────────────
  // Fetch objects by name to build routine steps.
  const allObjects = await db.objects.toArray();
  const objByName = new Map(allObjects.map((o) => [o.name, o]));

  const officeMorningId = generateId();
  const roomResetId = generateId();
  const laundryId = generateId();
  const nightShutdownId = generateId();

  await db.routines.bulkAdd([
    { id: officeMorningId, name: 'Office Morning', description: 'Everything you need before leaving', emoji: '💼', color: '#d4a043', estimatedDuration: 5, timeOfDay: 'morning', sortOrder: 0, createdAt: now, updatedAt: now },
    { id: roomResetId, name: 'Room Reset', description: 'Reset your room for the evening', emoji: '🧹', color: '#5b7ba0', estimatedDuration: 7, timeOfDay: 'evening', sortOrder: 1, createdAt: now, updatedAt: now },
    { id: laundryId, name: 'Laundry', description: 'Clothes through wash and dry cycle', emoji: '🧺', color: '#3a9d8c', estimatedDuration: 10, sortOrder: 2, createdAt: now, updatedAt: now },
    { id: nightShutdownId, name: 'Night Shutdown', description: 'Wind down and close up for the night', emoji: '🌙', color: '#8a8a92', estimatedDuration: 3, timeOfDay: 'night', sortOrder: 3, createdAt: now, updatedAt: now },
  ]);

  // Office Morning steps
  const officeId = objByName.get('Office ID Card');
  const watch = objByName.get('Watch');
  const headphones = objByName.get('JBL Headphones');
  if (officeId && watch && headphones) {
    await db.routineSteps.bulkAdd([
      { id: generateId(), routineId: officeMorningId, label: 'Pack Office ID', objectId: officeId.id, toMomentId: moment.packed, sortOrder: 0, createdAt: now, updatedAt: now },
      { id: generateId(), routineId: officeMorningId, label: 'Pack Watch', objectId: watch.id, toMomentId: moment.packed, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: generateId(), routineId: officeMorningId, label: 'Pack Headphones', objectId: headphones.id, toMomentId: moment.packed, sortOrder: 2, createdAt: now, updatedAt: now },
    ]);
  }

  // Room Reset steps
  const studyDesk = objByName.get('Study Desk');
  const room = objByName.get('Room');
  if (studyDesk && room) {
    await db.routineSteps.bulkAdd([
      { id: generateId(), routineId: roomResetId, label: 'Reset Desk', objectId: studyDesk.id, toMomentId: moment.reset, sortOrder: 0, createdAt: now, updatedAt: now },
      { id: generateId(), routineId: roomResetId, label: 'Clear Desk', objectId: studyDesk.id, toMomentId: moment.clear, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: generateId(), routineId: roomResetId, label: 'Reset Room', objectId: room.id, toMomentId: moment.resetState, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: generateId(), routineId: roomResetId, label: 'Clean Room', objectId: room.id, toMomentId: moment.cleanState, sortOrder: 3, createdAt: now, updatedAt: now },
    ]);
  }

  // Laundry steps
  const laundryLoad = objByName.get('Laundry Load');
  if (laundryLoad) {
    await db.routineSteps.bulkAdd([
      { id: generateId(), routineId: laundryId, label: 'Start Wash', objectId: laundryLoad.id, toMomentId: moment.washing, sortOrder: 0, createdAt: now, updatedAt: now },
    ]);
  }

  // Night Shutdown steps
  const laptop = objByName.get('Personal Laptop');
  if (laptop) {
    await db.routineSteps.bulkAdd([
      { id: generateId(), routineId: nightShutdownId, label: 'Close Laptop', objectId: laptop.id, toMomentId: moment.closed, sortOrder: 0, createdAt: now, updatedAt: now },
    ]);
  }
}
