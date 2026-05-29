import React, { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { createId } from '../helpers/ids';
import { Report, ReportDraft } from '../models/report';
import { db } from '../../firebase';

interface ReportsContextValue {
  reports: Report[];
  createReport: (draft: ReportDraft, userId: string) => Promise<Report>;
  updateReport: (reportId: string, updater: (report: Report) => Report) => void;
  removeReport: (reportId: string) => void;
  getReportById: (reportId: string) => Report | undefined;
}

const REPORTS_STORAGE_KEY = 'eco-reports';

const buildFirestoreReport = (report: Report) => {
  const location = report.location
    ? {
        ...(typeof report.location.latitude === 'number' ? { latitude: report.location.latitude } : {}),
        ...(typeof report.location.longitude === 'number' ? { longitude: report.location.longitude } : {}),
        ...(report.location.address ? { address: report.location.address } : {})
      }
    : undefined;

  return {
    reportId: report.reportId,
    userId: report.userId,
    title: report.title,
    observationType: report.observationType,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    ...(location ? { location } : {}),
    sensorEntries: report.sensorEntries.map((entry) => ({
      entryId: entry.entryId,
      sensorType: entry.sensorType,
      ...(entry.dataLabel ? { dataLabel: entry.dataLabel } : {}),
      ...(entry.dataValue ? { dataValue: entry.dataValue } : {}),
      ...(entry.mediaUrl ? { mediaUrl: entry.mediaUrl } : {}),
      description: entry.description,
      timestamp: entry.timestamp
    }))
  };
};

const parseReports = (value: string | null) => {
  if (!value) {
    return [] as Report[];
  }

  try {
    return JSON.parse(value) as Report[];
  } catch {
    return [] as Report[];
  }
};

export const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

export const ReportsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
        const nextReports = snapshot.docs.map((document) => document.data() as Report);

        if (nextReports.length > 0) {
          setReports(nextReports);
          localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(nextReports));
          return;
        }
      } catch {
        // Fall back to local cache if Firestore is unavailable.
      }

      setReports(parseReports(localStorage.getItem(REPORTS_STORAGE_KEY)));
    };

    void loadReports();
  }, []);

  useEffect(() => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const createReport = async (draft: ReportDraft, userId: string): Promise<Report> => {
    const now = new Date().toISOString();
    const report: Report = {
      reportId: createId(),
      userId,
      title: draft.title?.trim() || 'Untitled Report',
      observationType: draft.observationType ?? 'General Environmental Observation',
      createdAt: now,
      updatedAt: now,
      location: draft.location,
      sensorEntries: draft.sensorEntries
    };

    await addDoc(collection(db, 'reports'), buildFirestoreReport(report));

    setReports((prev) => [report, ...prev]);
    return report;
  };

  const updateReport = (reportId: string, updater: (report: Report) => Report) => {
    setReports((prev) =>
      prev.map((report) => (report.reportId === reportId ? updater(report) : report))
    );
  };

  const removeReport = (reportId: string) => {
    setReports((prev) => prev.filter((report) => report.reportId !== reportId));
  };

  const getReportById = (reportId: string) =>
    reports.find((report) => report.reportId === reportId);

  const value = useMemo(
    () => ({ reports, createReport, updateReport, removeReport, getReportById }),
    [reports]
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};
