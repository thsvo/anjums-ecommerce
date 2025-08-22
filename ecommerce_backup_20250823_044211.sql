--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'AUDIO',
    'DOCUMENT'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SMSStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SMSStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENT',
    'FAILED'
);


ALTER TYPE public."SMSStatus" OWNER TO postgres;

--
-- Name: WhatsAppMessageType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WhatsAppMessageType" AS ENUM (
    'TEXT',
    'TEMPLATE',
    'MEDIA'
);


ALTER TYPE public."WhatsAppMessageType" OWNER TO postgres;

--
-- Name: WhatsAppStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WhatsAppStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'SENT',
    'FAILED'
);


ALTER TYPE public."WhatsAppStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    street text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    country text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "userId" text,
    total double precision NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "shippingAddress" text NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerEmail" text,
    "customerName" text,
    "customerPhone" text,
    "paidAt" timestamp(3) without time zone,
    "paymentTransactionId" text,
    "paymentValidationId" text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    url text NOT NULL,
    "productId" text NOT NULL,
    "isMain" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    image text NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "categoryId" text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer DEFAULT 1 NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: sms_campaign_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_campaign_logs (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    action text NOT NULL,
    details jsonb,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sms_campaign_logs OWNER TO postgres;

--
-- Name: sms_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    message text NOT NULL,
    recipients text[],
    status public."SMSStatus" DEFAULT 'DRAFT'::public."SMSStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "totalCount" integer DEFAULT 0 NOT NULL,
    "deliveredCount" integer DEFAULT 0 NOT NULL,
    "failedCount" integer DEFAULT 0 NOT NULL,
    "apiProvider" text,
    "apiResponse" jsonb,
    "failedNumbers" text[] DEFAULT ARRAY[]::text[],
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sms_campaigns OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar text,
    "dateOfBirth" timestamp(3) without time zone,
    phone text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: whatsapp_campaign_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_campaign_logs (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    action text NOT NULL,
    details jsonb,
    "phoneNumber" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.whatsapp_campaign_logs OWNER TO postgres;

--
-- Name: whatsapp_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    "messageType" public."WhatsAppMessageType" DEFAULT 'TEXT'::public."WhatsAppMessageType" NOT NULL,
    "textMessage" text,
    "templateName" text,
    "templateParams" jsonb,
    "mediaUrl" text,
    "mediaType" public."MediaType",
    recipients text[],
    status public."WhatsAppStatus" DEFAULT 'DRAFT'::public."WhatsAppStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "totalCount" integer DEFAULT 0 NOT NULL,
    "deliveredCount" integer DEFAULT 0 NOT NULL,
    "readCount" integer DEFAULT 0 NOT NULL,
    "failedCount" integer DEFAULT 0 NOT NULL,
    "apiResponse" jsonb,
    "failedNumbers" text[] DEFAULT ARRAY[]::text[],
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.whatsapp_campaigns OWNER TO postgres;

--
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_templates (
    id text NOT NULL,
    name text NOT NULL,
    "displayName" text NOT NULL,
    category text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    status text NOT NULL,
    components jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.whatsapp_templates OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3d01c6b5-1edd-4afd-a2d8-8811fafbce91	b7ca33d774c6579ad25be727121bd172eeced626b7aee88c6454d7e790634246	2025-06-23 01:40:28.367236+06	20250622194028_initial_migration	\N	\N	2025-06-23 01:40:28.300177+06	1
fed3354d-e403-4b53-8e2a-8556ebd3e9a9	75661ea9ca77c5b67e3f4e9a895f61465e0233bca3f6d3d818f456afaa734c10	2025-06-23 03:44:32.138716+06	20250622214432_add_guest_order_support	\N	\N	2025-06-23 03:44:32.129484+06	1
96aa23ef-0f7a-407d-9215-d3d0da7e66d5	5f77471cb5a32e9a3b936a2d4ec2e99064f935b8cefc00b28dee4ca714264a04	2025-06-25 20:17:24.094228+06	20250625141724_add_product_images	\N	\N	2025-06-25 20:17:24.048004+06	1
5ac0d023-5bd7-49a8-9edd-c2d82eb4d4cb	1e02447ceed94ac60389c52a8704f3527eab6c1943b15544085072afecf58047	2025-06-28 19:51:13.162738+06	20250628135113_add_sslcommerz_payment_fields	\N	\N	2025-06-28 19:51:13.143322+06	1
194bdd5c-5ebc-43a6-b72a-278b7830ce18	9c65800623bc37e8394836e20d095626aac647badfe1f201ad80d215a4453b31	2025-06-29 03:05:09.400497+06	20250628210509_add_user_profile_fields	\N	\N	2025-06-29 03:05:09.384855+06	1
8f57fdce-dbb5-4c45-b0bb-90c0dd0408f0	15e6f08aa62cb5e7e00332c9116b68ee61c2d9103898123bdfc52c12e4e91470	2025-06-29 22:59:16.423374+06	20250629165916_add_sms_campaign_tables	\N	\N	2025-06-29 22:59:16.380895+06	1
b317beb1-cda5-43f1-a74d-44703eff15bd	20ab1e9df6a291fc1ef60261b04ae1fd91d172d51ebbf9d5b5f6801d16865626	2025-06-29 23:52:02.066178+06	20250629175202_make_sms_user_optional	\N	\N	2025-06-29 23:52:02.049733+06	1
382925ad-ed9e-41c1-aeab-c40525822a68	de00980874221f2f5042b803c77305f46decc9e8d58b4ed31cfca055062d44ad	2025-06-30 00:18:58.647259+06	20250629181858_add_whatsapp_campaigns	\N	\N	2025-06-30 00:18:58.60486+06	1
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", street, city, state, "zipCode", country, "isDefault") FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "userId", "productId", quantity) FROM stdin;
cmendv5k00001lp4gm6mgqb8y	cmd6ph3r00000v9acs75hz2bx	cmend9i9z0001lp04pw4xihgj	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, image, "createdAt", "updatedAt") FROM stdin;
cmen4gme20000lpagowenymcn	Nails	Nails	/uploads/categories/category-1755884778836-340391933.jpg	2025-08-22 17:46:18.842	2025-08-22 17:46:18.842
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", quantity, price) FROM stdin;
cmenbl16k0003lpe8g9rpoaj2	cmenbl15x0001lpe8c5a3xvwu	cmen4z8ha0001lptswzq69lg3	1	90
cmenblbc60007lpe8cpa3eei7	cmenblbbz0005lpe8sgro0kcn	cmen4z8ha0001lptswzq69lg3	1	90
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "userId", total, status, "shippingAddress", "paymentMethod", "paymentStatus", "createdAt", "updatedAt", "customerEmail", "customerName", "customerPhone", "paidAt", "paymentTransactionId", "paymentValidationId") FROM stdin;
cmcbyubx30005tlxn78f5zplh	\N	999.99	PENDING	post goga thana sharsha	Cash on Delivery	PENDING	2025-06-25 13:04:08.151	2025-06-25 13:04:08.151	\N	Tariqul Islam	01792577349	\N	\N	\N
cmcbywali0009tlxnlp8klfrx	\N	999.99	PENDING	House no: 320\nGoga	Cash on Delivery	PENDING	2025-06-25 13:05:39.75	2025-06-25 13:05:39.75	torikul2388@outlook.com	Tariqul Islam	01792577349	\N	\N	\N
cmcbz3kud000dtlxnt0ncfgbv	\N	999.99	PENDING	post goga thana sharsha	Cash on Delivery	PENDING	2025-06-25 13:11:19.622	2025-06-25 13:11:19.622	\N	Tariqul Islam	01792577349	\N	\N	\N
cmcd1xdac0001kdj7droo7p4c	\N	445	PENDING	House no: 320\nGoga	Cash on Delivery	PENDING	2025-06-26 07:18:14.915	2025-06-26 07:18:14.915	torikul2388@outlook.com	Tariqul Islam	01792577349	\N	\N	\N
cmchdg6gh0009255hmq2412jx	\N	150	PENDING	Goga, sharsha	Cash on Delivery	PENDING	2025-06-29 07:51:53.008	2025-06-29 07:51:53.008	imthsvo@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmc887lz40003fc23up6rteic	\N	999.99	SHIPPED	Post: Goga	Cash on Delivery	PENDING	2025-06-22 22:15:19.551	2025-06-26 07:28:01.856	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmcbyctez0001tlxnzmljq08o	\N	999.99	CONFIRMED	post goga thana sharsha	Cash on Delivery	PENDING	2025-06-25 12:50:31.02	2025-06-26 07:28:05.264	hello@trywasteflow.com	Tariqul Islam	01792577349	\N	\N	\N
cmcd2cb7m0006kdj72jokrzqw	cmcd2bgr90000uw1rms2m0d4v	445	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-06-26 07:29:52.066	2025-06-26 07:29:52.066	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmcgbyi3z0002g6tk08xskr7l	cmcd2bgr90000uw1rms2m0d4v	445	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-06-28 14:22:22.508	2025-06-28 14:22:22.508	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmcgfzx10000cqdfycg0a4ulq	cmcd2bgr90000uw1rms2m0d4v	4	CONFIRMED	{"fullName":"Tariqul Islam","phone":"01792577349","address":"Post: Goga","city":"Customer City","state":"Customer State","zipCode":"12345","country":"Bangladesh"}	SSLCommerz	PAID	2025-06-28 16:15:26.964	2025-06-28 16:15:51.972	laptopsakku@gmail.com	Tariqul Islam	01792577349	2025-06-28 16:15:51.816	TXN_cmcgfzx10000cqdfycg0a4ulq_1751127327209	250628221549BkqnrqoaIizmY0C
cmchgb3je000qeoj2sbldfgy8	cmchei4za0000jwose3fyk9w5	150	PENDING	{"fullName":"Tariqul Islam","phone":"01792577349","address":"Goga, sharsha","city":"Customer City","state":"Customer State","zipCode":"12345","country":"Bangladesh"}	SSLCommerz	PENDING	2025-06-29 09:11:54.794	2025-06-29 09:11:55.439	imthsvo@gmail.com	Tariqul Islam	01792577349	\N	TXN_cmchgb3je000qeoj2sbldfgy8_1751188315215	\N
cmchgrglk0002sk0g5lpl6ww2	cmchei4za0000jwose3fyk9w5	150	CONFIRMED	{"fullName":"Tariqul Islam","phone":"01792577349","address":"House no: 320\\nGoga","city":"Customer City","state":"Customer State","zipCode":"12345","country":"Bangladesh"}	SSLCommerz	PAID	2025-06-29 09:24:38.217	2025-06-29 09:24:55.502	imthsvo@gmail.com	Tariqul Islam	01792577349	2025-06-29 09:24:55.448	TXN_cmchgrglk0002sk0g5lpl6ww2_1751189078412	2506291524561EdBCVtnEbJYwX3
cmd9i7dy50001v9a047q308wn	cmcd2bgr90000uw1rms2m0d4v	100	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-07-19 00:22:33.82	2025-07-19 00:22:33.82	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmd9iasj60005v9a0j54d4c2i	cmcd2bgr90000uw1rms2m0d4v	100	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-07-19 00:25:12.69	2025-07-19 00:25:12.69	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmd9omkih0003lpbw3wyqxgcr	cmcd2bgr90000uw1rms2m0d4v	100	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-07-19 03:22:19.866	2025-07-19 03:22:19.866	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
cmen45v6o0000lpegfj2wp68l	\N	100	PENDING	kolkata	Cash on Delivery	PENDING	2025-08-22 17:37:57.024	2025-08-22 17:37:57.024	hello@lienmate.com	Timothy Lee Kowis	07478312940	\N	\N	\N
cmenbl15x0001lpe8c5a3xvwu	cmcd2bgr90000uw1rms2m0d4v	90	PENDING	{"fullName":"Tariqul Islam","phone":"01792577349","address":"Post: Goga","city":"Customer City","state":"Customer State","zipCode":"12345","country":"Bangladesh"}	SSLCommerz	PENDING	2025-08-22 21:05:41.924	2025-08-22 21:05:43.147	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	TXN_cmenbl15x0001lpe8c5a3xvwu_1755896742827	\N
cmenblbbz0005lpe8sgro0kcn	cmcd2bgr90000uw1rms2m0d4v	90	PENDING	Post: Goga	Cash on Delivery	PENDING	2025-08-22 21:05:55.104	2025-08-22 21:05:55.104	laptopsakku@gmail.com	Tariqul Islam	01792577349	\N	\N	\N
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, url, "productId", "isMain", "createdAt", "updatedAt") FROM stdin;
cmen4z8hn0003lptsr7qap31z	/uploads/c6e9051e-d375-4693-82fe-6d222a779bf0.jpg	cmen4z8ha0001lptswzq69lg3	t	2025-08-22 18:00:47.291	2025-08-22 18:00:47.291
cmend9ib20003lp04cw45k08i	/uploads/d2764805-94af-4746-a89b-17dcd91c586f.png	cmend9i9z0001lp04pw4xihgj	t	2025-08-22 21:52:43.503	2025-08-22 21:52:43.503
cmend9ibc0005lp04sdh7b1lz	/uploads/8828bc2d-1b3e-4b93-96fa-d253ec3b592c.jpg	cmend9i9z0001lp04pw4xihgj	f	2025-08-22 21:52:43.512	2025-08-22 21:52:43.512
cmend9ibj0007lp0417qyf8st	/uploads/9523d286-aca6-4a9d-a1ba-b8b3628be03b.png	cmend9i9z0001lp04pw4xihgj	f	2025-08-22 21:52:43.519	2025-08-22 21:52:43.519
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, image, stock, "categoryId", featured, "createdAt", "updatedAt") FROM stdin;
cmen4z8ha0001lptswzq69lg3	Tariqul Islam	90 tk only ( glue sticker free )\r\n	90	/uploads/c6e9051e-d375-4693-82fe-6d222a779bf0.jpg	598	cmen4gme20000lpagowenymcn	f	2025-08-22 18:00:47.278	2025-08-22 21:05:55.117
cmend9i9z0001lp04pw4xihgj	Tariqul Islam		100	/uploads/d2764805-94af-4746-a89b-17dcd91c586f.png	500	cmen4gme20000lpagowenymcn	f	2025-08-22 21:52:43.463	2025-08-22 21:52:43.522
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "userId", "productId", rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sms_campaign_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_campaign_logs (id, "campaignId", action, details, "userId", "createdAt") FROM stdin;
cmchza47s0002v9b8tqet79ee	cmchz9yr70000v9b8f8yellj0	SENT	{"apiProvider": "SMS_BANGLADESH", "apiResponse": {"data": {"response": "{\\"success\\":0,\\"message\\":\\"Wrong Recipient\\",\\"response_code\\":103,\\"campaign_cost\\":0}", "recipients": 3, "formattedNumbers": ["88+8801859882384", "88+8801792577349", "88+8801760730064"]}, "message": "SMS sent successfully", "success": true}, "failedCount": 0, "deliveredCount": 3}	\N	2025-06-29 18:03:01.72
cmchzetam0005v9b83oo8u92c	cmchzen630003v9b8u2fsszmo	SENT	{"apiProvider": "SMS_BANGLADESH", "apiResponse": {"data": {"response": "{\\"success\\":1,\\"message\\":\\"SMS send successfully.\\",\\"response_code\\":100,\\"campaign_cost\\":2.04,\\"delivery_status\\":[{\\"MSISDN\\":\\"8801859882384\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801859882384\\"},{\\"MSISDN\\":\\"8801792577349\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801792577349\\"},{\\"MSISDN\\":\\"8801760730064\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801760730064\\"}]}", "recipients": 3, "formattedNumbers": ["8801792577349", "8801760730064", "8801859882384"]}, "message": "SMS sent successfully", "success": true}, "failedCount": 0, "deliveredCount": 3}	\N	2025-06-29 18:06:40.846
\.


--
-- Data for Name: sms_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_campaigns (id, name, message, recipients, status, "scheduledAt", "sentAt", "totalCount", "deliveredCount", "failedCount", "apiProvider", "apiResponse", "failedNumbers", "createdBy", "createdAt", "updatedAt") FROM stdin;
cmchz9yr70000v9b8f8yellj0	ANJUM's	ANJUM's এ চলে এলো নতুন সানগ্লাস। দেখুন এখনে: https://www.facebook.com/share/p/1Amgkd7VVy	{+8801859882384,+8801792577349,+8801760730064}	SENT	\N	2025-06-29 18:03:01.712	3	3	0	SMS_BANGLADESH	{"data": {"response": "{\\"success\\":0,\\"message\\":\\"Wrong Recipient\\",\\"response_code\\":103,\\"campaign_cost\\":0}", "recipients": 3, "formattedNumbers": ["88+8801859882384", "88+8801792577349", "88+8801760730064"]}, "message": "SMS sent successfully", "success": true}	{}	\N	2025-06-29 18:02:54.643	2025-06-29 18:03:01.714
cmchzen630003v9b8u2fsszmo	ANJUM's	ANJUM's এ চলে এলো নতুন সানগ্লাস। দেখুন এখনে: https://www.facebook.com/share/p/1Amgkd7VVy	{01792577349,01760730064,01859882384}	SENT	\N	2025-06-29 18:06:40.84	3	3	0	SMS_BANGLADESH	{"data": {"response": "{\\"success\\":1,\\"message\\":\\"SMS send successfully.\\",\\"response_code\\":100,\\"campaign_cost\\":2.04,\\"delivery_status\\":[{\\"MSISDN\\":\\"8801859882384\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801859882384\\"},{\\"MSISDN\\":\\"8801792577349\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801792577349\\"},{\\"MSISDN\\":\\"8801760730064\\",\\"Status\\":1,\\"StatusText\\":\\"Sent\\",\\"smsid\\":\\"1416397-8801760730064\\"}]}", "recipients": 3, "formattedNumbers": ["8801792577349", "8801760730064", "8801859882384"]}, "message": "SMS sent successfully", "success": true}	{}	\N	2025-06-29 18:06:32.907	2025-06-29 18:06:40.841
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt", avatar, "dateOfBirth", phone) FROM stdin;
cmcd2bgr90000uw1rms2m0d4v	laptopsakku@gmail.com	$2a$10$Ck/TBu9DXuyUigWvl6HZgOdLhtqWwk5zZl84J9JNiKG31Bo7O301K	Tariqul	Islam	USER	2025-06-26 07:29:12.597	2025-06-26 07:29:12.597	\N	\N	\N
cmchei4za0000jwose3fyk9w5	imthsvo@gmail.com	$2a$10$nvCzd3XR4KetHT5q46E2mereS/MzasgU5X1I/xOoisC5TprdN/5FG	Tariqul	Islam	USER	2025-06-29 08:21:24.022	2025-06-29 08:21:24.022	\N	\N	\N
cmd6ph3r00000v9acs75hz2bx	admin@ecommerce.com	$2a$10$OsvHYuQYWnvkxI/Kg2pfxe0MA0uK5hra3mPzFimfrabfaPbPotx9W	Admin	User	ADMIN	2025-07-17 01:22:45.948	2025-07-17 01:22:45.948	\N	\N	\N
cmd9acveq0000v9b8ne160hge	torikul2388@outlook.com	$2a$10$pMXd/HZfmSV9jbOBorBA6eeP1RweOU/NrbvvbN09bezrVelMyJdJS	Tariqul	Islam	USER	2025-07-18 20:42:52.802	2025-07-18 20:42:52.802	\N	\N	\N
cmd9gsior0000v9kw5s3dl7kf	laptopsakku10@gmail.com	$2a$10$G1K0MO4sTUbjcxuJ0uhV/.zFQLMFdtptV6bVxga2eOmXMymSIIZoO	Tariqul	Islam	USER	2025-07-18 23:43:00.507	2025-07-18 23:43:00.507	\N	\N	\N
cmd9gtxwl0001v9kwfro9s0po	laptopsakku11@gmail.com	$2a$10$vCz8Gz2V99n4MRL07/OXg.Xy0ZyXLrMCAmT8XnCoeNnBSVnwlk4M.	Tariqul	Islam	USER	2025-07-18 23:44:06.885	2025-07-18 23:44:06.885	\N	\N	\N
cmd9gwtzd0002v9kwabue83zg	laptopsakku12@gmail.com	$2a$10$LZ85oJq2r0IQCRJwbAmcIueA460jV/PO6pAeK0f6TPNy2zf6x06Jq	Tariqul	Islam	USER	2025-07-18 23:46:21.77	2025-07-18 23:46:21.77	\N	\N	\N
cmd9hdz440003v9kworxmejj9	laptopsakku100@gmail.com	$2a$10$OQ3O0Svbp.FWZvKTbihHVurT8b42qiC8OFpYiU6jfZrNdIZk05ojy	Tariqul	Islam	USER	2025-07-18 23:59:41.572	2025-07-18 23:59:41.572	\N	\N	\N
cmd9hjdpc0004v9kwdlklpxjh	laptopsakku1000@gmail.com	$2a$10$fFJDzzxd8vYK5vuZKuxvtuf297jFcaApWQHws7VAVUasBWlels1k2	Tariqul	Islam	USER	2025-07-19 00:03:53.761	2025-07-19 00:03:53.761	\N	\N	\N
cmd9hkp660005v9kwuniu096e	laptopsakku10010@gmail.com	$2a$10$a8v0Ywr8YFYOSj05TMVoh.TRCM62iXkTyD7p5ix4UiURng0nOHcBe	Tariqul	Islam	USER	2025-07-19 00:04:55.279	2025-07-19 00:04:55.279	\N	\N	\N
cmd9hoasa0006v9kwf8jc4iq6	1laptopsakku@gmail.com	$2a$10$hwtcDjW6CfGpB13x7DLItuAD4rii4FFvd38bK/fyQYwpUrOkOtm0q	Tariqul	Islam	USER	2025-07-19 00:07:43.259	2025-07-19 00:07:43.259	\N	\N	\N
cmd9hqnu40007v9kwfkkfhv01	laptodpsakku100@gmail.com	$2a$10$DLFAY/CUcGO5NK1y6rNkz./xxt45xrbiSuSP7JYbgilCVybNBD4vy	Tariqul	Islam	USER	2025-07-19 00:09:33.485	2025-07-19 00:09:33.485	\N	\N	\N
cmdgtcue50000lpl024fycfyy	imthsvo1@gmail.com	$2a$10$gIJ3y9nlVJDQo1JpU6a87emAihlM/v3FralBc1nrHyhQIrjmcXITe	Tariqul	Islam	USER	2025-07-24 03:09:07.421	2025-07-24 03:09:07.421	\N	\N	\N
cmemu5h3v0000lp6cr9s4f7rp	test@example.com	$2a$10$sHsZGhst7QYdTm4zWcfP1OY5WgzLOuRZB4G80HcsCbjY7ALpbZk2K	Test	User	USER	2025-08-22 12:57:42.619	2025-08-22 12:57:42.619	\N	\N	\N
\.


--
-- Data for Name: whatsapp_campaign_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_campaign_logs (id, "campaignId", action, details, "phoneNumber", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: whatsapp_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_campaigns (id, name, "messageType", "textMessage", "templateName", "templateParams", "mediaUrl", "mediaType", recipients, status, "scheduledAt", "sentAt", "totalCount", "deliveredCount", "readCount", "failedCount", "apiResponse", "failedNumbers", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_templates (id, name, "displayName", category, language, status, components, "createdAt", "updatedAt") FROM stdin;
cmcj2prd90007v94sx4gwt322	anjums	anjums	MARKETING	en	APPROVED	[{"text": "ANJUM's", "type": "HEADER", "format": "TEXT"}, {"text": "ANJUM's এ চলে আসলো নতুন প্রোডাক্ট।", "type": "BODY"}, {"text": "Happy Shopping", "type": "FOOTER"}, {"type": "BUTTONS", "buttons": [{"url": "https://www.facebook.com/ceoanjum", "text": "Visit website", "type": "URL"}]}]	2025-06-30 12:26:56.59	2025-06-30 13:32:40.143
cmcj2grjn0000v9fs2emtzc7i	hello_world	hello_world	UTILITY	en_US	APPROVED	[{"text": "Hello World", "type": "HEADER", "format": "TEXT"}, {"text": "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.", "type": "BODY"}, {"text": "WhatsApp Business Platform sample message", "type": "FOOTER"}]	2025-06-30 12:19:56.915	2025-06-30 13:32:40.146
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sms_campaign_logs sms_campaign_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_campaign_logs
    ADD CONSTRAINT sms_campaign_logs_pkey PRIMARY KEY (id);


--
-- Name: sms_campaigns sms_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_campaigns
    ADD CONSTRAINT sms_campaigns_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT whatsapp_campaign_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_campaigns whatsapp_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT whatsapp_campaigns_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: cart_items_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON public.cart_items USING btree ("userId", "productId");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: reviews_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON public.reviews USING btree ("userId", "productId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: whatsapp_templates_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX whatsapp_templates_name_key ON public.whatsapp_templates USING btree (name);


--
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sms_campaign_logs sms_campaign_logs_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_campaign_logs
    ADD CONSTRAINT "sms_campaign_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.sms_campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sms_campaign_logs sms_campaign_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_campaign_logs
    ADD CONSTRAINT "sms_campaign_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sms_campaigns sms_campaigns_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_campaigns
    ADD CONSTRAINT "sms_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT "whatsapp_campaign_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.whatsapp_campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT "whatsapp_campaign_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: whatsapp_campaigns whatsapp_campaigns_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT "whatsapp_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

