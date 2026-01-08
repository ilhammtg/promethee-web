-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 08, 2026 at 05:51 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `promethee_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `aggregation`
--

CREATE TABLE `aggregation` (
  `id` int NOT NULL,
  `alt_a` int DEFAULT NULL,
  `alt_b` int DEFAULT NULL,
  `value_aggregation` decimal(10,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alternatives`
--

CREATE TABLE `alternatives` (
  `id` int NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alternatives`
--

INSERT INTO `alternatives` (`id`, `code`, `name`, `created_at`) VALUES
(1, 'A1', 'RSUD Fauziah', '2025-12-16 10:11:58'),
(2, 'A2', 'RS Jempa', '2025-12-16 10:11:58'),
(3, 'A3', 'Puskesmas J', '2025-12-16 10:11:58'),
(4, 'A4', 'RSU Malahayati', '2025-12-16 10:11:58'),
(5, 'A5', 'RS BMC', '2025-12-16 10:11:58'),
(6, 'A6', 'RSU Avicenna', '2025-12-16 10:11:58'),
(7, 'A7', 'RSU Telaga Bunda', '2025-12-16 10:11:58');

-- --------------------------------------------------------

--
-- Table structure for table `criteria`
--

CREATE TABLE `criteria` (
  `id` int NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `type` enum('benefit','cost') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `criteria`
--

INSERT INTO `criteria` (`id`, `code`, `name`, `weight`, `type`, `created_at`) VALUES
(1, 'C1', 'Keparahan Penyakit', '0.30', 'benefit', '2025-12-16 10:11:23'),
(2, 'C2', 'Fasilitas Puskesmas', '0.20', 'benefit', '2025-12-16 10:11:23'),
(3, 'C3', 'Jarak RS Rujukan', '0.15', 'cost', '2025-12-16 10:11:23'),
(4, 'C4', 'Kompetensi Nakes', '0.15', 'benefit', '2025-12-16 10:11:23'),
(5, 'C5', 'Ketersediaan TT RS', '0.10', 'benefit', '2025-12-16 10:11:23'),
(6, 'C6', 'Ekonomi Pasien', '0.10', 'cost', '2025-12-16 10:11:23');

-- --------------------------------------------------------

--
-- Table structure for table `criteria_parameters`
--

CREATE TABLE `criteria_parameters` (
  `id` int NOT NULL,
  `criteria_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `criteria_parameters`
--

INSERT INTO `criteria_parameters` (`id`, `criteria_id`, `name`, `value`, `created_at`) VALUES
(1, 1, 'Sangat Ringan', '40.00', '2026-01-08 05:02:19'),
(2, 1, 'Ringan', '50.00', '2026-01-08 05:02:19'),
(3, 1, 'Cukup Sedang', '70.00', '2026-01-08 05:02:19'),
(4, 1, 'Sedang', '82.00', '2026-01-08 05:02:19'),
(5, 1, 'Parah', '88.00', '2026-01-08 05:02:19'),
(6, 1, 'Sangat Parah', '90.00', '2026-01-08 05:02:19'),
(7, 2, 'Sangat Minim', '40.00', '2026-01-08 05:02:19'),
(8, 2, 'Minim', '50.00', '2026-01-08 05:02:19'),
(9, 2, 'Sedikit Lengkap', '60.00', '2026-01-08 05:02:19'),
(10, 2, 'Cukup Lengkap', '70.00', '2026-01-08 05:02:19'),
(11, 2, 'Lengkap', '80.00', '2026-01-08 05:02:19'),
(12, 3, '< 5 km', '1.00', '2026-01-08 05:02:19'),
(13, 3, '5 - 10 km', '2.00', '2026-01-08 05:02:19'),
(14, 3, '10 - 15 km', '3.00', '2026-01-08 05:02:19'),
(15, 3, '15 - 20 km', '4.00', '2026-01-08 05:02:19'),
(16, 3, '20 - 25 km', '5.00', '2026-01-08 05:02:19'),
(17, 3, '> 25 km', '6.00', '2026-01-08 05:02:19'),
(18, 4, 'Tidak Berpengalaman', '40.00', '2026-01-08 05:02:19'),
(19, 4, 'Minim Pengalaman', '50.00', '2026-01-08 05:02:19'),
(20, 4, 'Cukup Berpengalaman', '65.00', '2026-01-08 05:02:19'),
(21, 4, 'Kurang Berpengalaman', '75.00', '2026-01-08 05:02:19'),
(22, 4, 'Berpengalaman', '80.00', '2026-01-08 05:02:19'),
(23, 4, 'Sangat Berpengalaman', '90.00', '2026-01-08 05:02:19'),
(24, 5, '< 20 TT', '45.00', '2026-01-08 05:02:19'),
(25, 5, '20 - 29 TT', '55.00', '2026-01-08 05:02:19'),
(26, 5, '30 - 39 TT', '60.00', '2026-01-08 05:02:19'),
(27, 5, '40 - 49 TT', '70.00', '2026-01-08 05:02:19'),
(28, 5, '50 - 60 TT', '80.00', '2026-01-08 05:02:19'),
(29, 6, 'Sangat tidak mampu', '1.00', '2026-01-08 05:02:19'),
(30, 6, 'Kurang mampu', '2.00', '2026-01-08 05:02:19'),
(31, 6, 'Menengah', '3.00', '2026-01-08 05:02:19'),
(32, 6, 'Menengah atas', '4.00', '2026-01-08 05:02:19'),
(33, 6, 'Mampu', '5.00', '2026-01-08 05:02:19'),
(34, 6, 'Sangat mampu', '6.00', '2026-01-08 05:02:19');

-- --------------------------------------------------------

--
-- Table structure for table `flows`
--

CREATE TABLE `flows` (
  `id` int NOT NULL,
  `alternative_id` int DEFAULT NULL,
  `leaving_flow` decimal(10,6) DEFAULT NULL,
  `entering_flow` decimal(10,6) DEFAULT NULL,
  `net_flow` decimal(10,6) DEFAULT NULL,
  `ranking` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `flows`
--

INSERT INTO `flows` (`id`, `alternative_id`, `leaving_flow`, `entering_flow`, `net_flow`, `ranking`) VALUES
(120, 1, '0.242222', '0.082778', '0.159444', 2),
(121, 2, '0.123333', '0.111667', '0.011667', 4),
(122, 3, '0.372222', '0.100000', '0.272222', 1),
(123, 4, '0.072222', '0.402778', '-0.330556', 7),
(124, 5, '0.058889', '0.171667', '-0.112778', 6),
(125, 6, '0.150000', '0.091667', '0.058333', 3),
(126, 7, '0.100000', '0.158333', '-0.058333', 5);

-- --------------------------------------------------------

--
-- Table structure for table `normalized`
--

CREATE TABLE `normalized` (
  `id` int NOT NULL,
  `alternative_id` int DEFAULT NULL,
  `criteria_id` int DEFAULT NULL,
  `value_normalized` decimal(10,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `condition_notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `recommended_alt_id` int DEFAULT NULL,
  `input_data` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `name`, `age`, `gender`, `condition_notes`, `created_at`, `recommended_alt_id`, `input_data`) VALUES
(6, 'cipa', 20, 'P', 'sakit parah', '2026-01-08 12:28:34', 3, '{\"1\": 90, \"2\": 80, \"3\": 6, \"4\": 90, \"5\": 80, \"6\": 6}'),
(7, 'syifa safira', 20, 'P', 'demam', '2026-01-08 12:44:06', 6, '{\"1\": 88, \"2\": 80, \"3\": 5, \"4\": 90, \"5\": 80, \"6\": 6}');

-- --------------------------------------------------------

--
-- Table structure for table `preference`
--

CREATE TABLE `preference` (
  `id` int NOT NULL,
  `alt_a` int DEFAULT NULL,
  `alt_b` int DEFAULT NULL,
  `criteria_id` int DEFAULT NULL,
  `value_preference` decimal(10,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` int NOT NULL,
  `alternative_id` int DEFAULT NULL,
  `criteria_id` int DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `scores`
--

INSERT INTO `scores` (`id`, `alternative_id`, `criteria_id`, `value`) VALUES
(1, 1, 1, '90.00'),
(2, 1, 2, '70.00'),
(3, 1, 3, '6.00'),
(4, 1, 4, '80.00'),
(5, 1, 5, '60.00'),
(6, 1, 6, '3.00'),
(7, 2, 1, '90.00'),
(8, 2, 2, '80.00'),
(9, 2, 3, '6.00'),
(10, 2, 4, '90.00'),
(11, 2, 5, '70.00'),
(12, 2, 6, '2.00'),
(13, 3, 1, '90.00'),
(14, 3, 2, '60.00'),
(15, 3, 3, '6.00'),
(16, 3, 4, '75.00'),
(17, 3, 5, '55.00'),
(18, 3, 6, '4.00'),
(19, 4, 1, '88.00'),
(20, 4, 2, '80.00'),
(21, 4, 3, '6.00'),
(22, 4, 4, '90.00'),
(23, 4, 5, '80.00'),
(24, 4, 6, '3.00'),
(25, 5, 1, '90.00'),
(26, 5, 2, '80.00'),
(27, 5, 3, '6.00'),
(28, 5, 4, '90.00'),
(29, 5, 5, '60.00'),
(30, 5, 6, '4.00'),
(31, 6, 1, '90.00'),
(32, 6, 2, '80.00'),
(33, 6, 3, '6.00'),
(34, 6, 4, '90.00'),
(35, 6, 5, '80.00'),
(36, 6, 6, '2.00'),
(37, 7, 1, '90.00'),
(38, 7, 2, '80.00'),
(39, 7, 3, '6.00'),
(40, 7, 4, '90.00'),
(41, 7, 5, '80.00'),
(42, 7, 6, '5.00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','viewer') DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aggregation`
--
ALTER TABLE `aggregation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `alternatives`
--
ALTER TABLE `alternatives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `criteria`
--
ALTER TABLE `criteria`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `criteria_parameters`
--
ALTER TABLE `criteria_parameters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `criteria_id` (`criteria_id`);

--
-- Indexes for table `flows`
--
ALTER TABLE `flows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alternative_id` (`alternative_id`);

--
-- Indexes for table `normalized`
--
ALTER TABLE `normalized`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_patient_referral` (`recommended_alt_id`);

--
-- Indexes for table `preference`
--
ALTER TABLE `preference`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alternative_id` (`alternative_id`),
  ADD KEY `criteria_id` (`criteria_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aggregation`
--
ALTER TABLE `aggregation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alternatives`
--
ALTER TABLE `alternatives`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `criteria`
--
ALTER TABLE `criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `criteria_parameters`
--
ALTER TABLE `criteria_parameters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `flows`
--
ALTER TABLE `flows`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `normalized`
--
ALTER TABLE `normalized`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `preference`
--
ALTER TABLE `preference`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `criteria_parameters`
--
ALTER TABLE `criteria_parameters`
  ADD CONSTRAINT `criteria_parameters_ibfk_1` FOREIGN KEY (`criteria_id`) REFERENCES `criteria` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `flows`
--
ALTER TABLE `flows`
  ADD CONSTRAINT `flows_ibfk_1` FOREIGN KEY (`alternative_id`) REFERENCES `alternatives` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `fk_patient_referral` FOREIGN KEY (`recommended_alt_id`) REFERENCES `alternatives` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`alternative_id`) REFERENCES `alternatives` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`criteria_id`) REFERENCES `criteria` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
