import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, X, ImageIcon, Search, Info, Check, Eye, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { addService, getServices, updateService, deleteService } from "../../apiservice/service";
import { addSubService, getSubServices, updateSubService, deleteSubService } from "../../apiservice/subservice";
import { addSubService1, getAllSubService1, updateSubService1, deleteSubService1 } from "../../apiservice/subservice_1";
import { addSubService2, getAllSubService2, updateSubService2, deleteSubService2 } from "../../apiservice/subservice_2";
import { addSubService3, getAllSubService3, updateSubService3, deleteSubService3 } from "../../apiservice/subservice_3";
import { getImageUrl } from "../../utils/imageUtils";
import toast from "react-hot-toast";

const inp = "w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all";

// Price validation: accepts positive number OR range like 400-600
const isValidPrice = (val) => {
  if (!val || String(val).trim() === "") return true; // empty = optional ok
  const s = String(val).trim();
  // Range format: two positive numbers separated by a dash e.g. 400-600
  if (s.includes("-")) {
    const parts = s.split("-");
    if (parts.length !== 2) return false;
    const [a, b] = parts.map(p => parseFloat(p.trim()));
    return !isNaN(a) && !isNaN(b) && a > 0 && b > 0 && b >= a;
  }
  const n = parseFloat(s);
  return !isNaN(n) && n > 0 && String(n) === s;
};

const calculateDiscountedPrice = (price, discount) => {
  if (!price) return price;
  const strPrice = String(price);
  if (strPrice.includes('-')) {
    return strPrice.split('-').map(p => {
      const num = parseFloat(p.trim());
      return !isNaN(num) ? Math.round(num - (num * discount / 100)) : p.trim();
    }).join('-');
  }
  const num = parseFloat(price);
  return !isNaN(num) ? Math.round(num - (num * discount / 100)) : price;
};

const ServiceManagement = () => {
  // Service lists state
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [sub1List, setSub1List] = useState([]);
  const [sub2List, setSub2List] = useState([]);
  const [sub3List, setSub3List] = useState([]);
  const [compiledList, setCompiledList] = useState([]);

  // UI & Pagination state
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, type: "", step: 1, data: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    serviceId: "",
    subServiceId: "",
    subService1Id: "",
    subService2Id: "",
  });
  const [image, setImage] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resS, resSS, resSS1, resSS2, resSS3] = await Promise.all([
        getServices(),
        getSubServices(),
        getAllSubService1(),
        getAllSubService2(),
        getAllSubService3()
      ]);

      const listS = resS.data?.data || resS.data || [];
      const listSS = resSS.data?.data || resSS.data || [];
      const listSS1 = resSS1.data?.data || resSS1.data || [];
      const listSS2 = resSS2.data?.data || resSS2.data || [];
      const listSS3 = resSS3.data?.data || resSS3.data || [];

      setServices(listS);
      setSubServices(listSS);
      setSub1List(listSS1);
      setSub2List(listSS2);
      setSub3List(listSS3);

      // Compile data for unified display matching the second image
      const compiled = [];

      // Level 0: Services
      listS.forEach((s) => {
        compiled.push({
          id: s._id,
          type: "service",
          level: 0,
          serviceName: s.name,
          subService1: "-",
          subService2: "-",
          subService3: "-",
          subService4: "-",
          price: s.price ? `₹${s.price}` : "-",
          rawPrice: s.price,
          description: s.description || "-",
          discount: s.discount || 0,
          image: s.image,
          originalData: s
        });
      });

      // Level 1: Sub Services
      listSS.forEach((ss) => {
        compiled.push({
          id: ss._id,
          type: "subservice",
          level: 1,
          serviceName: ss.serviceId?.name || "-",
          subService1: ss.name,
          subService2: "-",
          subService3: "-",
          subService4: "-",
          price: "-",
          rawPrice: "",
          description: "-",
          originalData: ss
        });
      });

      // Level 2: Sub Service 1
      listSS1.forEach((ss1) => {
        compiled.push({
          id: ss1._id,
          type: "subservice1",
          level: 2,
          serviceName: ss1.serviceId?.name || "-",
          subService1: ss1.subServiceId?.name || "-",
          subService2: ss1.name,
          subService3: "-",
          subService4: "-",
          price: "-",
          rawPrice: "",
          description: "-",
          originalData: ss1
        });
      });

      // Level 3: Sub Service 2
      listSS2.forEach((ss2) => {
        compiled.push({
          id: ss2._id,
          type: "subservice2",
          level: 3,
          serviceName: ss2.serviceId?.name || "-",
          subService1: ss2.subServiceId?.name || "-",
          subService2: ss2.subService1Id?.name || "-",
          subService3: ss2.name,
          subService4: "-",
          price: ss2.price ? `₹${ss2.price}` : "-",
          rawPrice: ss2.price,
          description: ss2.description || "-",
          originalData: ss2
        });
      });

      // Level 4: Sub Service 3
      listSS3.forEach((ss3) => {
        compiled.push({
          id: ss3._id,
          type: "subservice3",
          level: 4,
          serviceName: ss3.serviceId?.name || "-",
          subService1: ss3.subServiceId?.name || "-",
          subService2: ss3.subService1Id?.name || "-",
          subService3: ss3.subService2Id?.name || "-",
          subService4: ss3.subService3Name || "-",
          price: ss3.price ? `₹${ss3.price}` : "-",
          rawPrice: ss3.price,
          description: ss3.description || "-",
          originalData: ss3
        });
      });

      setCompiledList(compiled);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load services data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, data = null) => {
    if (type === "edit") {
      let step = 1;
      let formFields = {};

      if (data.type === "service") {
        step = 1;
        formFields = {
          name: data.originalData.name || "",
          description: data.originalData.description || "",
          price: data.originalData.price || "",
          discount: data.originalData.discount || "",
          serviceId: data.originalData._id || "",   // ← own ID so Step 2 auto-selects this service
          subServiceId: "",
          subService1Id: "",
          subService2Id: "",
        };
      } else if (data.type === "subservice") {
        step = 2;
        formFields = {
          name: data.originalData.name || "",
          description: "",
          price: "",
          discount: "",
          serviceId: data.originalData.serviceId?._id || "",
          subServiceId: "",
          subService1Id: "",
          subService2Id: "",
        };
      } else if (data.type === "subservice1") {
        step = 3;
        formFields = {
          name: data.originalData.name || "",
          description: "",
          price: "",
          discount: "",
          serviceId: data.originalData.serviceId?._id || "",
          subServiceId: data.originalData.subServiceId?._id || "",
          subService1Id: "",
          subService2Id: "",
        };
      } else if (data.type === "subservice2") {
        step = 4;
        formFields = {
          name: data.originalData.name || "",
          description: data.originalData.description || "",
          price: data.originalData.price || "",
          discount: "",
          serviceId: data.originalData.serviceId?._id || "",
          subServiceId: data.originalData.subServiceId?._id || "",
          subService1Id: data.originalData.subService1Id?._id || "",
          subService2Id: "",
        };
      } else if (data.type === "subservice3") {
        step = 5;
        formFields = {
          name: data.originalData.subService3Name || "",
          description: data.originalData.description || "",
          price: data.originalData.price || "",
          discount: "",
          serviceId: data.originalData.serviceId?._id || "",
          subServiceId: data.originalData.subServiceId?._id || "",
          subService1Id: data.originalData.subService1Id?._id || "",
          subService2Id: data.originalData.subService2Id?._id || "",
        };
      }

      setModal({ open: true, type, step, data });
      setForm(formFields);
      setImage(null);
    } else {
      // Add sequence starts at Step 1
      setModal({ open: true, type: "add", step: 1, data: null });
      setForm({
        name: "",
        description: "",
        price: "",
        discount: "",
        serviceId: "",
        subServiceId: "",
        subService1Id: "",
        subService2Id: "",
      });
      setImage(null);
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", step: 1, data: null });
    setForm({
      name: "",
      description: "",
      price: "",
      discount: "",
      serviceId: "",
      subServiceId: "",
      subService1Id: "",
      subService2Id: "",
    });
    setImage(null);
    setPriceError("");
  };

  const handlePriceChange = (val) => {
    // Allow only digits, dash, and dot during typing
    if (val === "" || /^[\d.-]*$/.test(val)) {
      setForm(prev => ({ ...prev, price: val }));
      setPriceError(isValidPrice(val) ? "" : "Price must be a positive number or a valid range (e.g. 400-600)");
    }
  };

  // Duplicate Check logic mirroring first image
  const isDuplicateName = () => {
    if (!form.name) return false;
    const cleanName = form.name.trim().toLowerCase();

    if (modal.step === 1) {
      return services.some(s => s.name.trim().toLowerCase() === cleanName && s._id !== modal.data?.id);
    } else if (modal.step === 2) {
      return subServices.some(ss => ss.name.trim().toLowerCase() === cleanName && ss.serviceId?._id === form.serviceId && ss._id !== modal.data?.id);
    } else if (modal.step === 3) {
      return sub1List.some(s1 => s1.name.trim().toLowerCase() === cleanName && s1.subServiceId?._id === form.subServiceId && s1._id !== modal.data?.id);
    } else if (modal.step === 4) {
      return sub2List.some(s2 => s2.name.trim().toLowerCase() === cleanName && s2.subService1Id?._id === form.subService1Id && s2._id !== modal.data?.id);
    } else if (modal.step === 5) {
      return sub3List.some(s3 => (s3.subService3Name || "").trim().toLowerCase() === cleanName && s3.subService2Id?._id === form.subService2Id && s3._id !== modal.data?.id);
    }
    return false;
  };

  const handleNextStep = async () => {
    if (modal.step === 1) {
      if (!form.name) {
        setModal(prev => ({ ...prev, step: 2 }));
        return;
      }

      // Save step 1 (Parent Service)
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      if (form.price) fd.append("price", form.price);
      if (form.discount) fd.append("discount", Number(form.discount));
      if (image) fd.append("image", image);

      try {
        let savedId = "";
        if (modal.type === "edit") {
          await updateService(modal.data.id, fd);
          savedId = modal.data.id;
          toast.success("Service updated!");
        } else {
          const res = await addService(fd);
          savedId = res.data?.data?._id || res.data?._id;
          toast.success("Service created! Moving to Step 2.");
        }

        await fetchAllData();
        setForm(prev => ({ ...prev, serviceId: savedId, name: "", description: "", price: "", discount: "" }));
        setImage(null);
        setModal(prev => ({ ...prev, step: 2 }));
      } catch (err) {
        toast.error("Failed to save service");
      }
    } else if (modal.step === 2) {
      if (!form.name) {
        setModal(prev => ({ ...prev, step: 3 }));
        return;
      }

      // Save step 2 (Master/Sub Service)
      const payload = { serviceId: form.serviceId, name: form.name };

      try {
        let savedId = "";
        if (modal.type === "edit") {
          await updateSubService(modal.data.id, payload);
          savedId = modal.data.id;
          toast.success("Sub Service updated!");
        } else {
          const res = await addSubService(payload);
          savedId = res.data?.data?._id || res.data?._id;
          toast.success("Sub Service created! Moving to Step 3.");
        }

        await fetchAllData();
        setForm(prev => ({ ...prev, subServiceId: savedId, name: "" }));
        setModal(prev => ({ ...prev, step: 3 }));
      } catch (err) {
        toast.error("Failed to save sub service");
      }
    } else if (modal.step === 3) {
      if (!form.name) {
        setModal(prev => ({ ...prev, step: 4 }));
        return;
      }

      // Save step 3 (Sub Service 1)
      const payload = { serviceId: form.serviceId, subServiceId: form.subServiceId, name: form.name };

      try {
        let savedId = "";
        if (modal.type === "edit") {
          await updateSubService1(modal.data.id, payload);
          savedId = modal.data.id;
          toast.success("Sub Service1 updated!");
        } else {
          const res = await addSubService1(payload);
          savedId = res.data?.data?._id || res.data?._id;
          toast.success("Sub Service1 created! Moving to Step 4.");
        }

        await fetchAllData();
        setForm(prev => ({ ...prev, subService1Id: savedId, name: "" }));
        setModal(prev => ({ ...prev, step: 4 }));
      } catch (err) {
        toast.error("Failed to save sub service 1");
      }
    } else if (modal.step === 4) {
      if (!form.name) {
        setModal(prev => ({ ...prev, step: 5 }));
        return;
      }

      // Save step 4 (Sub Service 2)
      const fd = new FormData();
      fd.append("serviceId", form.serviceId);
      fd.append("subServiceId", form.subServiceId);
      fd.append("subService1Id", form.subService1Id);
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);

      try {
        let savedId = "";
        if (modal.type === "edit") {
          await updateSubService2(modal.data.id, fd);
          savedId = modal.data.id;
          toast.success("Sub Service2 updated!");
        } else {
          const res = await addSubService2(fd);
          savedId = res.data?.data?._id || res.data?._id;
          toast.success("Sub Service2 created! Moving to Step 5.");
        }

        await fetchAllData();
        setForm(prev => ({ ...prev, subService2Id: savedId, name: "", price: "", description: "" }));
        setModal(prev => ({ ...prev, step: 5 }));
      } catch (err) {
        toast.error("Failed to save sub service 2");
      }
    }
  };

  const handleSaveAndClose = async () => {
    if (isDuplicateName()) {
      toast.error("Duplicate check failed. Item already exists.");
      return;
    }

    if (modal.step === 1) {
      if (!form.name || !form.description) {
        toast.error("Name and Description are required");
        return;
      }
      if (form.price && !isValidPrice(form.price)) {
        toast.error("Price must be a positive number or valid range (e.g. 400-600)");
        setPriceError("Price must be a positive number or a valid range (e.g. 400-600)");
        return;
      }
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      if (form.price) fd.append("price", form.price);
      if (form.discount) fd.append("discount", Number(form.discount));
      if (image) fd.append("image", image);

      try {
        if (modal.type === "edit") await updateService(modal.data.id, fd);
        else await addService(fd);
        toast.success(modal.type === "edit" ? "Service updated!" : "Service added!");
        fetchAllData();
        closeModal();
      } catch (err) {
        toast.error("Failed to save service");
      }
    } else if (modal.step === 2) {
      if (!form.serviceId || !form.name) {
        toast.error("All fields are required");
        return;
      }
      const payload = { serviceId: form.serviceId, name: form.name };

      try {
        if (modal.type === "edit") await updateSubService(modal.data.id, payload);
        else await addSubService(payload);
        toast.success(modal.type === "edit" ? "Master service updated!" : "Master service added!");
        fetchAllData();
        closeModal();
      } catch (err) {
        toast.error("Failed to save master service");
      }
    } else if (modal.step === 3) {
      if (!form.serviceId || !form.subServiceId || !form.name) {
        toast.error("All fields are required");
        return;
      }
      const payload = { serviceId: form.serviceId, subServiceId: form.subServiceId, name: form.name };
      try {
        if (modal.type === "edit") await updateSubService1(modal.data.id, payload);
        else await addSubService1(payload);
        toast.success("Sub Service 1 saved!");
        fetchAllData();
        closeModal();
      } catch (err) {
        toast.error("Failed to save sub service 1");
      }
    } else if (modal.step === 4) {
      if (!form.serviceId || !form.subServiceId || !form.subService1Id || !form.name || !form.price || !form.description) {
        toast.error("All fields are required");
        return;
      }
      if (!isValidPrice(form.price)) {
        toast.error("Price must be a positive number or valid range (e.g. 400-600)");
        setPriceError("Price must be a positive number or a valid range (e.g. 400-600)");
        return;
      }
      const fd = new FormData();
      fd.append("serviceId", form.serviceId);
      fd.append("subServiceId", form.subServiceId);
      fd.append("subService1Id", form.subService1Id);
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);

      try {
        if (modal.type === "edit") await updateSubService2(modal.data.id, fd);
        else await addSubService2(fd);
        toast.success("Sub Service 2 saved!");
        fetchAllData();
        closeModal();
      } catch (err) {
        toast.error("Failed to save sub service 2");
      }
    } else if (modal.step === 5) {
      if (!form.serviceId || !form.subServiceId || !form.subService1Id || !form.subService2Id || !form.name || !form.price || !form.description) {
        toast.error("All fields are required");
        return;
      }
      if (!isValidPrice(form.price)) {
        toast.error("Price must be a positive number or valid range (e.g. 400-600)");
        setPriceError("Price must be a positive number or a valid range (e.g. 400-600)");
        return;
      }
      const fd = new FormData();
      fd.append("serviceId", form.serviceId);
      fd.append("subServiceId", form.subServiceId);
      fd.append("subService1Id", form.subService1Id);
      fd.append("subService2Id", form.subService2Id);
      fd.append("subService3Name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);

      try {
        if (modal.type === "edit") await updateSubService3(modal.data.id, fd);
        else await addSubService3(fd);
        toast.success("Sub Service 3 saved!");
        fetchAllData();
        closeModal();
      } catch (err) {
        toast.error("Failed to save sub service 3");
      }
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete this ${row.type === 'service' ? 'Parent Service' : row.type === 'subservice' ? 'Master Service' : 'Sub-Service'}?`)) return;

    try {
      if (row.type === "service") await deleteService(row.id);
      else if (row.type === "subservice") await deleteSubService(row.id);
      else if (row.type === "subservice1") await deleteSubService1(row.id);
      else if (row.type === "subservice2") await deleteSubService2(row.id);
      else if (row.type === "subservice3") await deleteSubService3(row.id);

      toast.success("Deleted successfully!");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const handleView = (row) => {
    setViewModal({ open: true, data: row });
  };

  // Filter lists based on Search
  const filteredList = compiledList.filter((s) => {
    const query = search.toLowerCase();
    return (
      (s.serviceName && s.serviceName.toLowerCase().includes(query)) ||
      (s.subService1 && s.subService1.toLowerCase().includes(query)) ||
      (s.subService2 && s.subService2.toLowerCase().includes(query)) ||
      (s.subService3 && s.subService3.toLowerCase().includes(query)) ||
      (s.subService4 && s.subService4.toLowerCase().includes(query)) ||
      (s.description && s.description.toLowerCase().includes(query))
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const duplicateCheckActive = isDuplicateName();

  return (
    <div className="space-y-5">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Service Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filteredList.length} services compiled</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-48"
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] hover:bg-[#0f1221] text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            <PlusCircle size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Unified Table representation exactly matching the second image layout */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1f36] text-white text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 border-r border-[#2d3555]">ID</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Service</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Sub Service</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Sub Service1</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Sub Service2</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Sub Service3</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Price</th>
                <th className="py-3 px-4 border-r border-[#2d3555]">Description</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">Loading services...</td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">No services found</td>
                </tr>
              ) : (
                paginatedList.map((row, index) => {
                  const runningIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={`${row.type}-${row.id}`}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-[#f2f6fa]"} hover:bg-blue-50/40 transition-colors`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-600 border-r border-gray-100">{runningIndex}</td>
                      {/* Service Name column — highlight if this row IS a service */}
                      <td className={`py-3 px-4 border-r border-gray-100 ${row.type === "service"
                        ? "font-bold text-[#1a1f36] bg-blue-50/60"
                        : "font-semibold text-gray-900"
                        }`}>
                        {row.type === "service" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a1f36] inline-block flex-shrink-0"></span>
                            {row.serviceName}
                          </span>
                        ) : row.serviceName}
                      </td>
                      {/* Sub-Service 1 (Master Service) column */}
                      <td className={`py-3 px-4 border-r border-gray-100 ${row.type === "subservice"
                        ? "font-bold text-emerald-700 bg-emerald-50/60"
                        : "text-gray-500"
                        }`}>
                        {row.type === "subservice" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                            {row.subService1}
                          </span>
                        ) : row.subService1}
                      </td>
                      {/* Sub-Service 2 column */}
                      <td className={`py-3 px-4 border-r border-gray-100 ${row.type === "subservice1"
                        ? "font-bold text-violet-700 bg-violet-50/60"
                        : "text-gray-500"
                        }`}>
                        {row.type === "subservice1" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block flex-shrink-0"></span>
                            {row.subService2}
                          </span>
                        ) : row.subService2}
                      </td>
                      {/* Sub-Service 3 column */}
                      <td className={`py-3 px-4 border-r border-gray-100 ${row.type === "subservice2"
                        ? "font-bold text-orange-700 bg-orange-50/60"
                        : "text-gray-500"
                        }`}>
                        {row.type === "subservice2" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block flex-shrink-0"></span>
                            {row.subService3}
                          </span>
                        ) : row.subService3}
                      </td>
                      {/* Sub-Service 4 column */}
                      <td className={`py-3 px-4 border-r border-gray-100 ${row.type === "subservice3"
                        ? "font-bold text-rose-700 bg-rose-50/60"
                        : "text-gray-500"
                        }`}>
                        {row.type === "subservice3" ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block flex-shrink-0"></span>
                            {row.subService4}
                          </span>
                        ) : row.subService4}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 border-r border-gray-100">
                        {row.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="line-through text-gray-400 font-normal">₹{row.rawPrice}</span>
                            <span>₹{calculateDiscountedPrice(row.rawPrice, row.discount)}</span>
                          </div>
                        ) : (
                          row.price
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 border-r border-gray-100 max-w-[200px] truncate" title={row.description}>
                        {row.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => openModal("edit", row)}
                            className="p-1.5 bg-[#1a1f36] text-white hover:bg-[#0f1221] rounded shadow-sm transition-all"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(row)}
                            className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded shadow-sm transition-all"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                          {/* View Details Button */}
                          <button
                            onClick={() => handleView(row)}
                            className="p-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded shadow-sm transition-all"
                            title="View"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50 border-t border-gray-100 text-xs">
          <div className="text-gray-500 font-medium">
            Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {/* Page buttons */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              // Limit shown pages if many
              if (totalPages > 5 && Math.abs(currentPage - p) > 1 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="px-1.5 text-gray-400">...</span>;
                }
                return null;
              }
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg border font-bold text-center transition-colors ${currentPage === p
                    ? "bg-[#1a1f36] border-[#1a1f36] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Service Sequence Wizard Modal (5-Step Stepper) */}
      {modal.open && (
        <div className="fixed inset-0 bg-[#131626]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1f36] rounded-lg shadow-2xl w-full max-w-3xl border border-white/10 overflow-hidden my-8 text-white">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#131626] border-b border-white/10 text-white">
              <h3 className="text-sm font-bold tracking-wide">
                {modal.type === "edit" ? "Edit Service Sequence" : "Add New Service Sequence"}
              </h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Informational 5-Step Stepper Wizard Header */}
            <div className="px-5 py-4 bg-[#15192c] border-b border-white/10 overflow-x-auto">
              {(() => {
                const allSteps = [
                  { id: 1, name: "Step 1: Service" },
                  { id: 2, name: "Step 2: Sub Service" },
                  { id: 3, name: "Step 3: Sub Service1" },
                  { id: 4, name: "Step 4: Sub Service2" },
                  { id: 5, name: "Step 5: Sub Service3" }
                ];

                const typeToMaxStep = { service: 1, subservice: 2, subservice1: 3, subservice2: 4, subservice3: 5 };
                const maxStep = modal.type === "edit" && modal.data
                  ? (typeToMaxStep[modal.data.type] || 5)
                  : 5;

                const visibleSteps = allSteps.filter(st => st.id <= maxStep);

                return (
                  <div className="flex items-center gap-2 text-[10px] py-1">
                    {visibleSteps.map((st, i) => {
                      const isActive = modal.step === st.id;
                      const isCompleted = modal.step > st.id;

                      return (
                        <React.Fragment key={st.id}>
                          <div
                            className={`flex items-center gap-1.5 select-none transition-all ${isActive ? "opacity-100" : "opacity-60"
                              }`}
                          >
                            <div
                              className={`flex items-center justify-center w-5 h-5 rounded-full border text-[9px] font-bold flex-shrink-0 ${isActive
                                ? "bg-blue-600 border-blue-600 text-white"
                                : isCompleted
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "bg-[#1a1f36] border-white/20 text-white/40"
                                }`}
                            >
                              {isCompleted ? <Check size={8} /> : st.id}
                            </div>
                            <div className="text-left leading-tight">
                              <span className={`font-bold block ${isActive ? "text-blue-400" : "text-white/80"}`}>
                                {st.name}
                              </span>
                            </div>
                          </div>
                          {i < visibleSteps.length - 1 && (
                            <div className="flex-1 h-[1px] bg-white/10 min-w-[16px]" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">

              {/* STEP 1: Parent Service Form */}
              {modal.step === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Electrical"
                        className={`w-full px-3 py-2 bg-[#15192c] border rounded-md text-sm text-white focus:outline-none focus:ring-1 transition-all ${duplicateCheckActive
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                      />
                      {duplicateCheckActive && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      )}
                    </div>
                    {duplicateCheckActive && (
                      <p className="text-xs text-red-400 mt-1 font-medium">
                        Required: New Parent Service. (Duplicate check active: "{form.name}" already exists)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Enter description..."
                      rows={3}
                      className={`
    w-full px-3 py-2 bg-[#15192c] border border-white/10 rounded-md
    text-sm text-white placeholder:text-gray-400 resize-none
    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
  `}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">Price (₹) (Optional)</label>
                      <input
                        type="text"
                        value={form.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="e.g. 499 or 400-600"
                        className={`
    w-full px-3 py-2 bg-[#15192c] border rounded-md
    text-sm text-white placeholder:text-gray-400
    focus:outline-none focus:ring-1 transition-all
    ${priceError
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }
  `}
                      />
                      {priceError && (
                        <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />{priceError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">Discount (%) (Optional)</label>
                      <input
                        type="number"
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 bg-[#15192c] border border-white/10 rounded-md
                         text-sm text-white placeholder:text-gray-400
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="w-full text-sm text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Master Service Form */}
              {modal.step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0"></span>
                        {services.find(s => s._id === form.serviceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.serviceId}
                        onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                        className={inp}
                      >
                        <option value="">Select Parent Service</option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. AC Repair"
                        className={`w-full px-3 py-2 bg-[#15192c] border rounded-md text-sm text-white focus:outline-none focus:ring-1 transition-all ${duplicateCheckActive
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                      />
                      {duplicateCheckActive && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      )}
                    </div>
                    {duplicateCheckActive && (
                      <p className="text-xs text-red-400 mt-1 font-medium">
                        Duplicate check active: "{form.name}" already exists under this parent service.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Sub-Service 1 Form */}
              {modal.step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0"></span>
                        {services.find(s => s._id === form.serviceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.serviceId}
                        onChange={(e) => setForm({ ...form, serviceId: e.target.value, subServiceId: "" })}
                        className={inp}
                      >
                        <option value="">Select Parent Service</option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                        {subServices.find(ss => ss._id === form.subServiceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subServiceId}
                        onChange={(e) => setForm({ ...form, subServiceId: e.target.value })}
                        className={inp}
                      >
                        <option value="">Select Master Service</option>
                        {subServices
                          .filter((ss) => ss.serviceId?._id === form.serviceId)
                          .map((ss) => (
                            <option key={ss._id} value={ss._id}>{ss.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service1</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Split AC"
                        className={`w-full px-3 py-2 bg-[#15192c] border rounded-md text-sm text-white focus:outline-none focus:ring-1 transition-all ${duplicateCheckActive
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                      />
                      {duplicateCheckActive && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      )}
                    </div>
                    {duplicateCheckActive && (
                      <p className="text-xs text-red-400 mt-1 font-medium">
                        Duplicate check active: "{form.name}" already exists under this master service.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Sub-Service 2 Form */}
              {modal.step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-[#45637d] inline-block flex-shrink-0"></span>
                        {services.find(s => s._id === form.serviceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-gray-400 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.serviceId}
                        onChange={(e) => setForm({ ...form, serviceId: e.target.value, subServiceId: "", subService1Id: "" })}
                        className={inp}
                      >
                        <option value="">Select Parent Service</option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Sub Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                        {subServices.find(ss => ss._id === form.subServiceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-gray-400 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subServiceId}
                        onChange={(e) => setForm({ ...form, subServiceId: e.target.value, subService1Id: "" })}
                        className={inp}
                      >
                        <option value="">Select Master Service</option>
                        {subServices
                          .filter((ss) => ss.serviceId?._id === form.serviceId)
                          .map((ss) => (
                            <option key={ss._id} value={ss._id}>{ss.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service1</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block flex-shrink-0"></span>
                        {sub1List.find(s1 => s1._id === form.subService1Id)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subService1Id}
                        onChange={(e) => setForm({ ...form, subService1Id: e.target.value })}
                        className={inp}
                      >
                        <option value="">Select Sub-Service 2</option>
                        {sub1List
                          .filter((s1) => s1.subServiceId?._id === form.subServiceId)
                          .map((s1) => (
                            <option key={s1._id} value={s1._id}>{s1.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service2</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Split AC Installation"
                        className={`w-full px-3 py-2 bg-[#15192c] border rounded-md text-sm text-white focus:outline-none focus:ring-1 transition-all ${duplicateCheckActive
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                      />
                      {duplicateCheckActive && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      )}
                    </div>
                    {duplicateCheckActive && (
                      <p className="text-xs text-red-400 mt-1 font-medium">
                        Duplicate check active: "{form.name}" already exists under this hierarchy.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">Price (₹)</label>
                      <input
                        type="text"
                        value={form.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="e.g. 499 or 400-600"
                        className={`${inp} ${priceError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      {priceError && (
                        <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />{priceError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Service details..."
                      rows={2}
                      className={inp + " resize-none"}
                    />
                  </div>
                </div>
              )}

              {modal.step === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block flex-shrink-0"></span>
                        {services.find(s => s._id === form.serviceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.serviceId}
                        onChange={(e) => setForm({ ...form, serviceId: e.target.value, subServiceId: "", subService1Id: "", subService2Id: "" })}
                        className={inp}
                      >
                        <option value="">Select Parent Service</option>
                        {services.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                        {subServices.find(ss => ss._id === form.subServiceId)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subServiceId}
                        onChange={(e) => setForm({ ...form, subServiceId: e.target.value, subService1Id: "", subService2Id: "" })}
                        className={inp}
                      >
                        <option value="">Select Master Service</option>
                        {subServices
                          .filter((ss) => ss.serviceId?._id === form.serviceId)
                          .map((ss) => (
                            <option key={ss._id} value={ss._id}>{ss.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service1</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block flex-shrink-0"></span>
                        {sub1List.find(s1 => s1._id === form.subService1Id)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subService1Id}
                        onChange={(e) => setForm({ ...form, subService1Id: e.target.value, subService2Id: "" })}
                        className={inp}
                      >
                        <option value="">Select Sub-Service 2</option>
                        {sub1List
                          .filter((s1) => s1.subServiceId?._id === form.subServiceId)
                          .map((s1) => (
                            <option key={s1._id} value={s1._id}>{s1.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service2</label>
                    {modal.type === "edit" ? (
                      <div className="w-full px-3 py-2 bg-[#131626] border border-white/5 rounded-md text-sm text-white/50 font-semibold flex items-center gap-2 cursor-not-allowed">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block flex-shrink-0"></span>
                        {sub2List.find(s2 => s2._id === form.subService2Id)?.name || "—"}
                        <span className="ml-auto text-[10px] text-white/30 font-normal">locked</span>
                      </div>
                    ) : (
                      <select
                        value={form.subService2Id}
                        onChange={(e) => setForm({ ...form, subService2Id: e.target.value })}
                        className={inp}
                      >
                        <option value="">Select Sub-Service 3</option>
                        {sub2List
                          .filter((s2) => s2.subService1Id?._id === form.subService1Id)
                          .map((s2) => (
                            <option key={s2._id} value={s2._id}>{s2.name}</option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Sub Service3</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Split AC Gas Charging"
                        className={`w-full px-3 py-2 bg-[#15192c] border rounded-md text-sm text-white focus:outline-none focus:ring-1 transition-all ${duplicateCheckActive
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                      />
                      {duplicateCheckActive && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      )}
                    </div>
                    {duplicateCheckActive && (
                      <p className="text-xs text-red-400 mt-1 font-medium">
                        Duplicate check active: "{form.name}" already exists under this hierarchy.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">Price (₹)</label>
                      <input
                        type="text"
                        value={form.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="e.g. 499 or 400-600"
                        className={`${inp} ${priceError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      {priceError && (
                        <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />{priceError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Service details..."
                      rows={2}
                      className={inp + " resize-none"}
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end gap-2 px-5 py-4 bg-[#131626] border-t border-white/10">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndClose}
                className={`px-5 py-2 text-white text-xs font-bold rounded shadow-sm transition-all ${modal.type === "edit" || modal.step === 5
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-[#242b4d] hover:bg-[#2c345c] border border-white/5"
                  }`}
              >
                Save and Close
              </button>

              {modal.type === "add" && modal.step < 5 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-md transition-all"
                >
                  Create & Next (Step {modal.step + 1})
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {viewModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f36] rounded-lg shadow-xl w-full max-w-md border border-white/10 overflow-hidden text-white">
            <div className="flex items-center justify-between px-5 py-3 bg-[#131626] border-b border-white/10 text-white">
              <h3 className="text-sm font-bold tracking-wide">Service Details</h3>
              <button onClick={() => setViewModal({ open: false, data: null })} className="text-white hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {viewModal.data.image && (
                <div className="w-full aspect-[4/3] bg-[#131626] rounded-lg overflow-hidden border border-white/5">
                  <img
                    src={getImageUrl(viewModal.data.image)}
                    alt={viewModal.data.serviceName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-white/50 uppercase block tracking-wider">Service Hierarchy</span>
                  <p className="text-sm text-white font-semibold mt-1">
                    {viewModal.data.serviceName}
                    {viewModal.data.subService1 !== "-" && ` > ${viewModal.data.subService1}`}
                    {viewModal.data.subService2 !== "-" && ` > ${viewModal.data.subService2}`}
                    {viewModal.data.subService3 !== "-" && ` > ${viewModal.data.subService3}`}
                    {viewModal.data.subService4 !== "-" && ` > ${viewModal.data.subService4}`}
                  </p>
                </div>
                {viewModal.data.price !== "-" && (
                  <div>
                    <span className="font-bold text-white/50 uppercase block tracking-wider">Price</span>
                    <p className="text-sm font-extrabold text-blue-400 mt-0.5">{viewModal.data.price}</p>
                  </div>
                )}
                {viewModal.data.discount > 0 && (
                  <div>
                    <span className="font-bold text-white/50 uppercase block tracking-wider">Discount</span>
                    <p className="text-sm font-bold text-green-400 mt-0.5">{viewModal.data.discount}% OFF</p>
                  </div>
                )}
                <div>
                  <span className="font-bold text-white/50 uppercase block tracking-wider">Description</span>
                  <p className="text-white/70 mt-1 leading-relaxed whitespace-pre-wrap">{viewModal.data.description}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-[#131626] border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setViewModal({ open: false, data: null })}
                className="px-4 py-1.5 bg-[#242b4d] hover:bg-[#2c345c] text-white/90 text-xs font-semibold rounded transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
