import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
dotenv.config({ path: './.env' });
dotenv.config({ path: '../server/.env' });

// Import models
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, enum: ['ADMIN', 'DELIVERY_AGENT', 'CUSTOMER', 'SUPPORT'], default: 'CUSTOMER' },
  phone: String, isActive: { type: Boolean, default: true }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const senderSchema = new mongoose.Schema({
  name: String, address: String, phone: String, email: String
}, { timestamps: true });
const Sender = mongoose.models.Sender || mongoose.model('Sender', senderSchema);

const receiverSchema = new mongoose.Schema({
  name: String, address: String, phone: String, email: String
}, { timestamps: true });
const Receiver = mongoose.models.Receiver || mongoose.model('Receiver', receiverSchema);

const parcelSchema = new mongoose.Schema({
  parcelId: { type: String, unique: true },
  status: { type: String, enum: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Cancelled'] },
  weight: Number, description: String, estimatedDeliveryDate: Date,
  senderId: mongoose.Schema.Types.ObjectId,
  receiverId: mongoose.Schema.Types.ObjectId,
  deliveryId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
const Parcel = mongoose.models.Parcel || mongoose.model('Parcel', parcelSchema);

const deliverySchema = new mongoose.Schema({
  deliveryId: { type: String, unique: true },
  parcelId: mongoose.Schema.Types.ObjectId,
  deliveryAgentId: mongoose.Schema.Types.ObjectId,
  currentLocation: String, latitude: Number, longitude: Number,
  estimatedDeliveryDate: Date, status: String, lastUpdated: Date, deliveryNotes: String
}, { timestamps: true });
const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);

const trackingSchema = new mongoose.Schema({
  parcelId: mongoose.Schema.Types.ObjectId,
  status: String, location: String, latitude: Number, longitude: Number,
  description: String, updatedBy: mongoose.Schema.Types.ObjectId, timestamp: Date
});
const TrackingHistory = mongoose.models.TrackingHistory || mongoose.model('TrackingHistory', trackingSchema);

const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, message: String,
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  read: { type: Boolean, default: false }, parcelId: String
}, { timestamps: true });
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const auditSchema = new mongoose.Schema({
  actor: mongoose.Schema.Types.ObjectId, actorName: String,
  action: String, entityType: String, entityId: String,
  oldValue: mongoose.Schema.Types.Mixed, newValue: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);

const LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Chennai':         { lat: 13.0827, lng: 80.2707 },
  'Coimbatore':      { lat: 11.0168, lng: 76.9558 },
  'Madurai':         { lat: 9.9252,  lng: 78.1198 },
  'Trichy':          { lat: 10.7905, lng: 78.7047 },
  'Salem':           { lat: 11.6643, lng: 78.1460 },
  'Thanjavur':       { lat: 10.7870, lng: 79.1378 },
  'Mayiladuthurai':  { lat: 11.1011, lng: 79.6547 },
  'Vellore':         { lat: 12.9165, lng: 79.1325 },
  'Erode':           { lat: 11.3410, lng: 77.7172 },
  'Warehouse':       { lat: 13.0827, lng: 80.2707 },
};

const locationList = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Thanjavur', 'Mayiladuthurai'];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swiftship';
    console.log('📡 Connecting to database host:', uri.includes('@') ? uri.split('@')[1] : '127.0.0.1');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), Sender.deleteMany({}), Receiver.deleteMany({}),
      Parcel.deleteMany({}), Delivery.deleteMany({}), TrackingHistory.deleteMany({}),
      Notification.deleteMany({}), AuditLog.deleteMany({})
    ]);
    console.log('🗑️  Cleared all collections');

    // Hash password helper
    const hashPwd = (pwd: string) => bcrypt.hashSync(pwd, 12);

    // ── USERS ──────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User', email: 'admin@swiftship.com',
      password: hashPwd('Admin@123'), role: 'ADMIN', phone: '9800000001', isActive: true
    });
    const support = await User.create({
      name: 'Support Team', email: 'support@swiftship.com',
      password: hashPwd('Support@123'), role: 'SUPPORT', phone: '9800000002', isActive: true
    });

    const agentData = [
      { name: 'Arun Kumar',      phone: '9876500001' },
      { name: 'Babu Rajesh',     phone: '9876500002' },
      { name: 'Chandru Mohan',   phone: '9876500003' },
      { name: 'Dinesh Selvam',   phone: '9876500004' },
      { name: 'Elumalai Rajan',  phone: '9876500005' },
    ];
    const agents = await Promise.all(agentData.map((a, i) =>
      User.create({ name: a.name, email: `agent${i + 1}@swiftship.com`, password: hashPwd('Agent@123'), role: 'DELIVERY_AGENT', phone: a.phone, isActive: true })
    ));

    const customerData = [
      { name: 'Karthik Murugan',      phone: '9900000001' },
      { name: 'Lakshmi Priya',        phone: '9900000002' },
      { name: 'Manoj Anand',          phone: '9900000003' },
      { name: 'Nithya Krishnan',      phone: '9900000004' },
      { name: 'Palani Vel',           phone: '9900000005' },
      { name: 'Radha Krishnamurthy',  phone: '9900000006' },
      { name: 'Senthil Kumar',        phone: '9900000007' },
      { name: 'Tamil Selvi',          phone: '9900000008' },
      { name: 'Uma Devi',             phone: '9900000009' },
      { name: 'Venkat Raman',         phone: '9900000010' },
    ];
    const customers = await Promise.all(customerData.map((c, i) =>
      User.create({ name: c.name, email: `customer${i + 1}@swiftship.com`, password: hashPwd('Customer@123'), role: 'CUSTOMER', phone: c.phone, isActive: true })
    ));
    console.log('👥 Users created:', 1 + 1 + agents.length + customers.length);

    // ── SENDERS ────────────────────────────────────────────────────────────
    const senderData = [
      { name: 'Rajesh Kumar',    address: 'No.45, Anna Nagar, Chennai - 600040',         phone: '9876543210', email: 'rajesh.k@gmail.com' },
      { name: 'Meena Sundaram',  address: '12, Coimbatore Road, Pollachi - 642001',       phone: '9765432109', email: 'meena.s@gmail.com' },
      { name: 'Prakash Iyer',    address: '78, Gandhi Street, Madurai - 625001',          phone: '9654321098', email: 'prakash.i@gmail.com' },
      { name: 'Sudha Lakshmi',   address: '34, Nehru Nagar, Trichy - 620001',             phone: '9543210987', email: 'sudha.l@gmail.com' },
      { name: 'Vijay Annamalai', address: '56, Salem Main Road, Salem - 636001',          phone: '9432109876', email: 'vijay.a@gmail.com' },
      { name: 'Kavitha Rajan',   address: '23, Temple Street, Thanjavur - 613001',        phone: '9321098765', email: 'kavitha.r@gmail.com' },
      { name: 'Murugan Pillai',  address: '89, Market Street, Mayiladuthurai - 609001',   phone: '9210987654', email: 'murugan.p@gmail.com' },
      { name: 'Anitha Selvam',   address: '67, Cross Street, Erode - 638001',             phone: '9109876543', email: 'anitha.s@gmail.com' },
      { name: 'Balamurugan T',   address: '12, Beach Road, Nagapattinam - 611001',        phone: '9098765432', email: 'bala.t@gmail.com' },
      { name: 'Chitra Devi',     address: '45, School Lane, Vellore - 632001',            phone: '9987654321', email: 'chitra.d@gmail.com' },
    ];
    const senders = await Sender.insertMany(senderData);
    console.log('📤 Senders created:', senders.length);

    // ── RECEIVERS ──────────────────────────────────────────────────────────
    const receiverData = [
      { name: 'Asha Krishnan',    address: '34, Park Avenue, Coimbatore - 641001',     phone: '9876543201', email: 'asha.k@gmail.com' },
      { name: 'Bharathi Raj',     address: '56, Lake View, Madurai - 625002',           phone: '9765432102', email: 'bharathi.r@gmail.com' },
      { name: 'Deepak Mohan',     address: '78, Flower Garden, Chennai - 600028',       phone: '9654321203', email: 'deepak.m@gmail.com' },
      { name: 'Gayathri S',       address: '90, Hill View, Ooty - 643001',              phone: '9543210304', email: 'gayathri.s@gmail.com' },
      { name: 'Harish Babu',      address: '12, River Side, Trichy - 620002',           phone: '9432100405', email: 'harish.b@gmail.com' },
      { name: 'Indira Devi',      address: '23, East Street, Salem - 636002',           phone: '9321090506', email: 'indira.d@gmail.com' },
      { name: 'Janani Ravi',      address: '45, North Street, Thanjavur - 613002',      phone: '9210980607', email: 'janani.r@gmail.com' },
      { name: 'Kumaran S',        address: '67, West Road, Mayiladuthurai - 609002',    phone: '9109870708', email: 'kumaran.s@gmail.com' },
      { name: 'Lalitha M',        address: '89, South Avenue, Tirunelveli - 627001',    phone: '9098760809', email: 'lalitha.m@gmail.com' },
      { name: 'Manimaran P',      address: '11, Central Park, Kanchipuram - 631001',    phone: '9987650910', email: 'manimaran.p@gmail.com' },
    ];
    const receivers = await Receiver.insertMany(receiverData);
    console.log('📥 Receivers created:', receivers.length);

    // ── PARCELS + DELIVERIES + TRACKING ────────────────────────────────────
    const parcelStatuses = [
      'Delivered', 'In Transit', 'Out for Delivery', 'Booked', 'Delayed',
      'Delivered', 'In Transit', 'Booked', 'Out for Delivery', 'Delivered',
      'Booked', 'In Transit', 'Delivered', 'Delayed', 'Booked',
      'Delivered', 'In Transit', 'Out for Delivery', 'Booked', 'Cancelled'
    ];
    const descriptions = ['Electronics', 'Clothing', 'Documents', 'Books', 'Fragile Items', 'Medical Supplies', 'Food Items', 'Jewelry', 'Auto Parts', 'Furniture'];

    const now = new Date();
    const parcelsCreated: any[] = [];

    for (let i = 0; i < 20; i++) {
      const status = parcelStatuses[i] as any;
      const sIdx = i % senders.length;
      const rIdx = (i + 3) % receivers.length;
      const cIdx = i % customers.length;
      const agentIdx = i % agents.length;

      const daysOffset = Math.floor(Math.random() * 14) + 1;
      const eta = new Date(now);
      eta.setDate(eta.getDate() + daysOffset);

      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - (20 - i));

      const parcelId = `P-${String(i + 1).padStart(3, '0')}`;
      const weight = parseFloat((Math.random() * 14.5 + 0.5).toFixed(1));

      // Create delivery first (placeholder)
      const deliveryId = `D-${String(i + 1).padStart(3, '0')}`;
      const destCity = locationList[rIdx % locationList.length];
      const destCoords = LOCATIONS[destCity];

      const delivery = await Delivery.create({
        deliveryId,
        parcelId: new mongoose.Types.ObjectId(), // placeholder
        deliveryAgentId: agents[agentIdx]._id,
        currentLocation: status === 'Delivered' || status === 'Out for Delivery' ? destCity : status === 'In Transit' ? locationList[Math.floor(Math.random() * locationList.length)] : 'Warehouse, Chennai',
        latitude: status === 'Delivered' || status === 'Out for Delivery' ? destCoords.lat : LOCATIONS['Chennai'].lat,
        longitude: status === 'Delivered' || status === 'Out for Delivery' ? destCoords.lng : LOCATIONS['Chennai'].lng,
        estimatedDeliveryDate: eta,
        status,
        lastUpdated: now,
        deliveryNotes: status === 'Delayed' ? 'Delayed due to bad weather conditions' : status === 'Delivered' ? 'Delivered successfully to receiver' : ''
      });

      const parcel = await Parcel.create({
        parcelId, status,
        weight, description: descriptions[i % descriptions.length],
        estimatedDeliveryDate: eta,
        senderId: senders[sIdx]._id,
        receiverId: receivers[rIdx]._id,
        deliveryId: delivery._id,
        customerId: customers[cIdx]._id,
        createdAt, updatedAt: now
      });

      // Update delivery with actual parcelId
      await Delivery.findByIdAndUpdate(delivery._id, { parcelId: parcel._id });

      // Create tracking history based on status
      const trackingEntries = [];
      const baseTime = new Date(createdAt);

      trackingEntries.push({
        parcelId: parcel._id, status: 'Booked',
        location: 'Warehouse, Chennai',
        latitude: LOCATIONS['Chennai'].lat, longitude: LOCATIONS['Chennai'].lng,
        description: 'Parcel booked and received at warehouse',
        updatedBy: admin._id, timestamp: new Date(baseTime)
      });

      if (['In Transit', 'Out for Delivery', 'Delivered', 'Delayed'].includes(status)) {
        baseTime.setHours(baseTime.getHours() + 12);
        const transitCity = locationList[Math.floor(Math.random() * 3)];
        trackingEntries.push({
          parcelId: parcel._id, status: 'In Transit',
          location: transitCity,
          latitude: LOCATIONS[transitCity].lat, longitude: LOCATIONS[transitCity].lng,
          description: `Parcel dispatched from Chennai, currently in ${transitCity}`,
          updatedBy: agents[agentIdx]._id, timestamp: new Date(baseTime)
        });
      }
      if (['Out for Delivery', 'Delivered'].includes(status)) {
        baseTime.setHours(baseTime.getHours() + 8);
        trackingEntries.push({
          parcelId: parcel._id, status: 'Out for Delivery',
          location: destCity,
          latitude: destCoords.lat, longitude: destCoords.lng,
          description: `Parcel is out for delivery in ${destCity}`,
          updatedBy: agents[agentIdx]._id, timestamp: new Date(baseTime)
        });
      }
      if (status === 'Delivered') {
        baseTime.setHours(baseTime.getHours() + 4);
        trackingEntries.push({
          parcelId: parcel._id, status: 'Delivered',
          location: destCity,
          latitude: destCoords.lat, longitude: destCoords.lng,
          description: 'Parcel delivered successfully to receiver',
          updatedBy: agents[agentIdx]._id, timestamp: new Date(baseTime)
        });
      }
      if (status === 'Delayed') {
        baseTime.setHours(baseTime.getHours() + 24);
        trackingEntries.push({
          parcelId: parcel._id, status: 'Delayed',
          location: 'Trichy Distribution Center',
          latitude: LOCATIONS['Trichy'].lat, longitude: LOCATIONS['Trichy'].lng,
          description: 'Parcel delayed due to bad weather. Expected delivery postponed.',
          updatedBy: agents[agentIdx]._id, timestamp: new Date(baseTime)
        });
      }

      await TrackingHistory.insertMany(trackingEntries);

      // Create notification for customer
      const notifMsg: Record<string, string> = {
        'Booked': `📦 Your parcel ${parcelId} has been booked successfully!`,
        'In Transit': `🚚 Your parcel ${parcelId} is now In Transit!`,
        'Out for Delivery': `🛵 Your parcel ${parcelId} is Out for Delivery! Expect it today.`,
        'Delivered': `✅ Your parcel ${parcelId} has been Delivered successfully!`,
        'Delayed': `⚠️ Your parcel ${parcelId} has been Delayed. We apologize.`,
        'Cancelled': `❌ Your parcel ${parcelId} has been Cancelled.`
      };
      await Notification.create({
        userId: customers[cIdx]._id,
        message: notifMsg[status] || `Your parcel ${parcelId} status: ${status}`,
        type: ['Delayed', 'Cancelled'].includes(status) ? 'warning' : status === 'Delivered' ? 'success' : 'info',
        parcelId,
        read: i > 10
      });

      // Audit log
      await AuditLog.create({
        actor: admin._id, actorName: 'Admin User',
        action: 'CREATE_PARCEL', entityType: 'Parcel', entityId: parcelId,
        newValue: { parcelId, status, weight }
      });

      parcelsCreated.push(parcel);
      process.stdout.write(`\r📦 Created parcels: ${i + 1}/20`);
    }
    console.log('\n✅ All parcels, deliveries, tracking history, and notifications created!');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('  DEMO LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('  Admin:    admin@swiftship.com     / Admin@123');
    console.log('  Agent:    agent1@swiftship.com    / Agent@123');
    console.log('  Customer: customer1@swiftship.com / Customer@123');
    console.log('  Support:  support@swiftship.com   / Support@123');
    console.log('═══════════════════════════════════════════');
    console.log('  Parcel IDs: P-001 to P-020');
    console.log('═══════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
