-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 21, 2025 at 09:05 AM
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
(2, 'C2', 'Fasilitas Puskesmas', '0.20', 'cost', '2025-12-16 10:11:23'),
(3, 'C3', 'Jarak RS Rujukan', '0.15', 'cost', '2025-12-16 10:11:23'),
(4, 'C4', 'Kompetensi Nakes', '0.15', 'cost', '2025-12-16 10:11:23'),
(5, 'C5', 'Ketersediaan TT RS', '0.10', 'benefit', '2025-12-16 10:11:23'),
(6, 'C6', 'Ekonomi Pasien', '0.10', 'cost', '2025-12-16 10:11:23');

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
(78, 1, '0.151022', '0.194812', '-0.043790', 4),
(79, 2, '0.348621', '0.092758', '0.255863', 2),
(80, 3, '0.222718', '0.289077', '-0.066359', 5),
(81, 4, '0.215585', '0.181806', '0.033780', 3),
(82, 5, '0.103155', '0.260486', '-0.157331', 6),
(83, 6, '0.416875', '0.115873', '0.301002', 1),
(84, 7, '0.092183', '0.415347', '-0.323165', 7);

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
(1, 1, 1, '85.00'),
(2, 1, 2, '70.00'),
(3, 1, 3, '10.00'),
(4, 1, 4, '80.00'),
(5, 1, 5, '60.00'),
(6, 1, 6, '3.00'),
(7, 2, 1, '90.00'),
(8, 2, 2, '65.00'),
(9, 2, 3, '8.00'),
(10, 2, 4, '85.00'),
(11, 2, 5, '70.00'),
(12, 2, 6, '2.00'),
(13, 3, 1, '78.00'),
(14, 3, 2, '60.00'),
(15, 3, 3, '12.00'),
(16, 3, 4, '75.00'),
(17, 3, 5, '55.00'),
(18, 3, 6, '4.00'),
(19, 4, 1, '88.00'),
(20, 4, 2, '72.00'),
(21, 4, 3, '9.00'),
(22, 4, 4, '82.00'),
(23, 4, 5, '68.00'),
(24, 4, 6, '3.00'),
(25, 5, 1, '80.00'),
(26, 5, 2, '68.00'),
(27, 5, 3, '11.00'),
(28, 5, 4, '78.00'),
(29, 5, 5, '60.00'),
(30, 5, 6, '4.00'),
(31, 6, 1, '92.00'),
(32, 6, 2, '66.00'),
(33, 6, 3, '7.00'),
(34, 6, 4, '88.00'),
(35, 6, 5, '75.00'),
(36, 6, 6, '2.00'),
(37, 7, 1, '76.00'),
(38, 7, 2, '69.00'),
(39, 7, 3, '13.00'),
(40, 7, 4, '74.00'),
(41, 7, 5, '58.00'),
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
-- AUTO_INCREMENT for table `flows`
--
ALTER TABLE `flows`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `normalized`
--
ALTER TABLE `normalized`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `flows`
--
ALTER TABLE `flows`
  ADD CONSTRAINT `flows_ibfk_1` FOREIGN KEY (`alternative_id`) REFERENCES `alternatives` (`id`) ON DELETE CASCADE;

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
